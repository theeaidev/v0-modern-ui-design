import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('[SERVER] POST /api/subscription received');
  
  try {
    const body = await request.json();
    const { userId, subscriptionTier } = body;
    
    console.log('[SERVER] Request body:', JSON.stringify(body, null, 2));
    
    if (!userId) {
      console.log('[SERVER] Error: User ID is required');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!subscriptionTier) {
      console.log('[SERVER] Error: Subscription tier is required');
      return NextResponse.json({ error: 'Subscription tier is required' }, { status: 400 });
    }
    
    // Valid subscription tiers according to the schema
    const validTiers = ['Basica', 'Premium', 'Premium Gold'];
    
    // Normalize subscription tier for comparison
    let normalizedTier = subscriptionTier;
    
    // Check if the tier is valid
    const isValidTier = validTiers.some(tier => 
      tier.toLowerCase() === normalizedTier.toLowerCase() ||
      tier.replace(' ', '') === normalizedTier.replace(' ', '')
    );
    
    if (!isValidTier) {
      console.log('[SERVER] Error: Invalid subscription tier:', subscriptionTier);
      console.log('[SERVER] Valid tiers are:', validTiers);
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }
    
    // Normalize to the exact format expected by the database
    if (normalizedTier.toLowerCase() === 'basica' || normalizedTier.toLowerCase() === 'básica') {
      normalizedTier = 'Basica';
    } else if (normalizedTier.toLowerCase() === 'premium') {
      normalizedTier = 'Premium';
    } else {
      normalizedTier = 'Premium Gold';
    }

    // Create a Supabase client with the server context
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log(`[SERVER] Saving subscription: ${normalizedTier} (original: ${subscriptionTier}) for user ${userId}`);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means not found
      console.error('[SERVER] Error checking profile:', profileError);
      return NextResponse.json({ error: 'Failed to check profile' }, { status: 500 });
    }
    
    let result;
    
    // If profile doesn't exist, create it
    if (!profile) {
      console.log('[SERVER] Profile not found, creating new profile');
      result = await supabase
        .from('profiles')
        .insert({
          id: userId,
          subscription_tier: normalizedTier,
          payment_status: 'pending_validation'
        });
    } else {
      // Update existing profile
      console.log('[SERVER] Updating existing profile');
      result = await supabase
        .from('profiles')
        .update({
          subscription_tier: normalizedTier,
          payment_status: 'pending_validation'
        })
        .eq('id', userId);
    }
    
    if (result.error) {
      console.error('[SERVER] Error saving subscription:', result.error);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }
    
    // Verify the data was saved
    const { data: verification, error: verificationError } = await supabase
      .from('profiles')
      .select('subscription_tier, payment_status')
      .eq('id', userId)
      .single();
      
    if (verificationError) {
      console.error('[SERVER] Error verifying data:', verificationError);
      // We still return success since the update/insert succeeded
    } else {
      console.log('[SERVER] Verification successful:', verification);
    }
    
    return NextResponse.json({ success: true, data: verification });
    
  } catch (error) {
    console.error('[SERVER] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
