"use client"

import type React from "react"
import { Switch } from "@/components/ui/switch";

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  Check,
  Upload,
  Clock,
  AlertCircle,
  Calendar,
  ImageIcon,
  Film,
  MessageCircle,
  Tag,
  X,
  CreditCard,
  Building,
  Phone,
  Megaphone,
} from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SiteFooter } from "@/components/site-footer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function TiendaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, session, isLoading } = useAuth()
  
  // Initialize Supabase client for database operations
  const supabase = createClientComponentClient()
  
  const [isGoldPlan, setIsGoldPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("bizum")
  const [externalPaymentInitiated, setExternalPaymentInitiated] = useState(false);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0])
    }
  }

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan)
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    setExternalPaymentInitiated(false);
    setPaymentConfirmed(false);
    setPaymentProof(null);
  };

  // Check if the user is authenticated - using the AuthContext
  const isAuthenticated = !!user;

  // Save subscription to Supabase using server API endpoint
  const saveSubscription = async () => {
    if (!selectedPlan) {
      console.error('No plan selected');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, selecciona un plan antes de continuar."
      });
      return false;
    }
    
    if (!user?.id) {
      console.error('User not authenticated');
      setShowLoginModal(true);
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      // Map selected plan to the proper format for database
      const planMapping: Record<string, string> = {
        "basica": "Basica",
        "premium": "Premium",
        "gold": "Premium Gold"
      };
      
      const subscriptionTier = planMapping[selectedPlan];
      const userId = user.id;
      
      console.log('[DEBUG] Saving subscription data via API:', {
        userId,
        subscriptionTier, 
        paymentMethod,
        selectedPlan
      });
      
      // Call our server API endpoint to update subscription
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscriptionTier,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save subscription');
      }
      
      // Detailed logging of API response
      console.log('[DEBUG] API response status:', response.status);
      console.log('[DEBUG] API response full:', JSON.stringify(result, null, 2));
      
      setPaymentSuccess(true);
      toast({
        title: "¡Pago recibido!", 
        description: "Tu suscripción ha sido registrada y está pendiente de validación."
      });
      return true;
    } catch (error) {
      console.error('[DEBUG] Error in saveSubscription:', error);
      toast({
        variant: "destructive",
        title: "Error guardando la suscripción",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al procesar tu suscripción."
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirm = async () => {
    // Verify we have a selected plan
    if (!selectedPlan) {
      toast({
        variant: "destructive",
        title: "Selecciona un plan",
        description: "Por favor selecciona un plan antes de continuar."
      });
      return;
    }
    
    // Check if user is logged in with the Auth context
    if (!user?.id) {
      console.log('User not authenticated, showing login modal');
      setShowLoginModal(true);
      return;
    }
    
    if (paymentMethod === "subscription") {
      // Redirect to specific payment links based on the selected plan
      if (selectedPlan === "basica") {
         window.open("https://checkout.revolut.com/pay/14122323-e9b3-47f2-8ca6-02b7fd3d3da5", "_blank", "noopener noreferrer");
         setExternalPaymentInitiated(true);
      } else if (selectedPlan === "premium") {
         window.open("https://checkout.revolut.com/payment-link/0519d26a-d794-42bd-bb29-e7498a2726de", "_blank", "noopener noreferrer");
         setExternalPaymentInitiated(true);
      } else if (selectedPlan === "gold") {
         window.open("https://checkout.revolut.com/payment-link/0519d26a-d794-42bd-bb29-e7498a2726de", "_blank", "noopener noreferrer"); // Using same link for now
         setExternalPaymentInitiated(true);
      }
    } else {
      // For other payment methods, save subscription to database
      console.log('Processing non-subscription payment, saving to database');
      setPaymentConfirmed(true);
      await saveSubscription();
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12 md:py-16 lg:py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Planes de Suscripción</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Elige el plan que mejor se adapte a tus necesidades y comienza a publicar tus anuncios
              </p>
              <div className="flex flex-wrap justify-center gap-4 my-6">
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors font-medium px-3 py-1.5"
                  >
                    Publicación inmediata
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors font-medium px-3 py-1.5"
                  >
                    Visibilidad garantizada
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 transition-colors font-medium px-3 py-1.5"
                  >
                    Soporte personalizado
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Plan Básico */}
              <Card
                className={`border-2 transition-all duration-300 ${selectedPlan === "basica" ? "border-green-500 shadow-lg shadow-green-100" : "hover:border-green-200"}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Badge className="h-8 w-8 rounded-full bg-green-500 text-white border-0 flex items-center justify-center p-0">
                      <span className="text-xs font-bold">B</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">Tarifa Básica</CardTitle>
                  <div className="mt-1 flex items-center justify-center">
                    <span className="text-3xl font-bold">5 €</span>
                    <span className="text-muted-foreground ml-1">/ mes</span>
                  </div>
                  <CardDescription className="mt-2">Ideal para publicar un anuncio sencillo</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Separator className="my-4" />
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Subida de <strong>1 anuncio</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Hasta <strong>6 imágenes</strong> por anuncio
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Anuncio visible durante <strong>2 meses</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        En el <strong>3º mes</strong>, si no se renueva, se elimina automáticamente
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>El pago inicial activa el anuncio</span>
                    </li>
                  </ul>
                  <div className="mt-6 p-3 bg-muted rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">Duración del anuncio</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <div className="h-10 w-0.5 bg-green-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 1</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <div className="h-10 w-0.5 bg-green-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 2</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-10 w-0.5 bg-yellow-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 3</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handlePlanSelect("basica")}
                  >
                    Elegir plan básico
                  </Button>
                </CardFooter>
              </Card>

              {/* Plan Premium */}
              <Card
                className={`border-2 transition-all duration-300 ${selectedPlan === "premium" ? "border-blue-500 shadow-lg shadow-blue-100" : "hover:border-blue-200"}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Badge className="h-8 w-8 rounded-full bg-blue-500 text-white border-0 flex items-center justify-center p-0">
                      <span className="text-xs font-bold">P</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">Tarifa Premium</CardTitle>
                  <div className="mt-1 flex items-center justify-center">
                    <span className="text-3xl font-bold">10 €</span>
                    <span className="text-muted-foreground ml-1">/ mes</span>
                  </div>
                  <CardDescription className="mt-2">Ideal para destacar tu anuncio con más contenido</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Separator className="my-4" />
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Subida de <strong>2 anuncios</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Hasta <strong>10 imágenes</strong> por anuncio
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        <strong>1 vídeo</strong> de máximo <strong>60 segundos</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        <strong>Anuncio destacado</strong> por 1 semana
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <span>Soporte por consultas</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Participación en ferias presenciales con <strong>-25% de descuento</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Anuncio visible durante <strong>3 meses.</strong> El tercer mes es <strong>gratuito.</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        En el <strong>4º mes</strong>, si no se renueva, se elimina automáticamente
                      </span>
                    </li>
                  </ul>
                  <div className="mt-6 p-3 bg-muted rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">Duración del anuncio</span>
                    </div>
                    <div className="flex items-center justify-around px-1">
                      {[1, 2, 3].map((month) => (
                        <div key={month} className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <div className="h-10 w-0.5 bg-green-500"></div>
                          <span className="text-xs text-muted-foreground mt-1">Mes {month}</span>
                        </div>
                      ))}
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-10 w-0.5 bg-yellow-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 4</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handlePlanSelect("premium")}
                  >
                    Elegir plan premium
                  </Button>
                </CardFooter>
              </Card>

              {/* Plan Premium Gold */}
              <Card
                className={`border-2 transition-all duration-300 ${selectedPlan === "gold" ? "border-amber-500 shadow-lg shadow-amber-100" : "hover:border-amber-200"}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Badge className="h-8 w-8 rounded-full bg-amber-500 text-white border-0 flex items-center justify-center p-0">
                      <span className="text-xs font-bold">G</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">Tarifa Premium Gold</CardTitle>
                  <div className="mt-1 flex items-center justify-center">
                    <span className="text-3xl font-bold">25 €</span>
                    <span className="text-muted-foreground ml-1">/ 6 meses</span>
                  </div>
                  <CardDescription className="mt-2">Todo lo del Premium, ¡más promoción en redes sociales!</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Separator className="my-4" />
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Subida de <strong>2 anuncios</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Hasta <strong>10 imágenes</strong> por anuncio
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        <strong>1 vídeo</strong> de máximo <strong>60 segundos</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        <strong>Anuncio destacado</strong> por 1 semana <strong>y promoción en redes sociales</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>Soporte por consultas</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Participación en ferias presenciales con <strong>-25% de descuento</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        Anuncio visible durante <strong>6 meses</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        En el <strong>7º mes</strong>, si no se renueva, se elimina automáticamente
                      </span>
                    </li>
                  </ul>
                  <div className="mt-6 p-3 bg-muted rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">Duración del anuncio</span>
                    </div>
                    <div className="flex items-center justify-around px-1">
                      {[1, 2, 3, 4, 5, 6].map((month) => (
                        <div key={month} className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <div className="h-10 w-0.5 bg-green-500"></div>
                          <span className="text-xs text-muted-foreground mt-1">M{month}</span>
                        </div>
                      ))}
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-10 w-0.5 bg-yellow-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">M7</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => handlePlanSelect("gold")}
                  >
                    Elegir plan premium gold
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-8 bg-muted/30">
          <div className="container max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Preguntas frecuentes</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Cuándo se activa mi suscripción?</AccordionTrigger>
                <AccordionContent>
                  Tu suscripción se activa una vez que validemos el pago. Esto suele tardar entre 24-48 horas laborables.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>¿Puedo cambiar de plan más adelante?</AccordionTrigger>
                <AccordionContent>
                  Sí, puedes actualizar o cambiar tu plan en cualquier momento. Si cambias a un plan superior, se te cobrará la diferencia prorrateada.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>¿Qué ocurre cuando finaliza mi suscripción?</AccordionTrigger>
                <AccordionContent>
                  Cuando finaliza el período de tu suscripción, tu anuncio permanecerá visible durante un mes adicional. Pasado ese tiempo, si no has renovado, el anuncio se eliminará automáticamente.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>¿Cómo funciona la promoción en redes sociales?</AccordionTrigger>
                <AccordionContent>
                  Con el plan Premium Gold, promocionaremos tu anuncio en nuestras redes sociales oficiales. Esto incluye una mención destacada con imágenes de tu anuncio y enlaces directos.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>¿Puedo solicitar un reembolso?</AccordionTrigger>
                <AccordionContent>
                  Ofrecemos reembolsos dentro de los primeros 7 días desde la activación de tu suscripción si no estás satisfecho con el servicio. Contacta con nuestro equipo de soporte para más información.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Comparison Table (Mobile Friendly) */}
        <section className="py-8 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-8">Comparativa de planes</h2>

            <div className="md:hidden">
              <Tabs defaultValue="basica">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basica">Básica</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                  <TabsTrigger value="gold">Premium Gold</TabsTrigger>
                </TabsList>
                <TabsContent value="basica" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-500">Tarifa Básica</CardTitle>
                      <CardDescription>5 € / mes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          Imágenes
                        </span>
                        <span className="font-medium">6 máximo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Film className="h-4 w-4 mr-2 text-muted-foreground" />
                          Vídeo
                        </span>
                        <span className="font-medium">No incluido</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          Duración
                        </span>
                        <span className="font-medium">2 meses</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                          Soporte
                        </span>
                        <span className="font-medium">No incluido</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                          Descuento en ferias
                        </span>
                        <span className="font-medium">No incluido</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="premium" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-500">Tarifa Premium</CardTitle>
                      <CardDescription>10 € / mes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          Imágenes
                        </span>
                        <span className="font-medium">10 máximo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Film className="h-4 w-4 mr-2 text-muted-foreground" />
                          Vídeo
                        </span>
                        <span className="font-medium">1 (60 segundos)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          Duración
                        </span>
                        <span className="font-medium">3 meses (El tercer mes es gratis)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                          Soporte
                        </span>
                        <span className="font-medium">Incluido</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                          Descuento en ferias
                        </span>
                        <span className="font-medium">25% descuento</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Megaphone className="h-4 w-4 mr-2 text-muted-foreground" />
                          Promoción en redes
                        </span>
                        <span className="font-medium">No incluido</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="gold" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-amber-500">Tarifa Premium Gold</CardTitle>
                      <CardDescription>25 € / 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          Imágenes
                        </span>
                        <span className="font-medium">10 máximo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Film className="h-4 w-4 mr-2 text-muted-foreground" />
                          Vídeo
                        </span>
                        <span className="font-medium">1 (60 segundos)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          Duración
                        </span>
                        <span className="font-medium">6 meses</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                          Soporte
                        </span>
                        <span className="font-medium">Incluido</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                          Descuento en ferias
                        </span>
                        <span className="font-medium">25% descuento</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Megaphone className="h-4 w-4 mr-2 text-muted-foreground" />
                          Promoción en redes
                        </span>
                        <span className="font-medium">Incluido</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop Comparison Table */}
            <div className="hidden md:block overflow-hidden rounded-lg border bg-background">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left">Características</th>
                      <th className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <Badge className="bg-green-500 text-white border-0 mb-1">Básico</Badge>
                          <span className="text-sm font-normal">5 € / mes</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <Badge className="bg-blue-500 text-white border-0 mb-1">Premium</Badge>
                          <span className="text-sm font-normal">10 € / mes</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <Badge className="bg-amber-500 text-white border-0 mb-1">Premium Gold</Badge>
                          <span className="text-sm font-normal">25 € / 6 meses</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        Imágenes
                      </td>
                      <td className="p-4 text-center">6 máximo</td>
                      <td className="p-4 text-center">10 máximo</td>
                      <td className="p-4 text-center">10 máximo</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 flex items-center">
                        <Film className="h-4 w-4 mr-2 text-muted-foreground" />
                        Vídeo
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-4 w-4 mx-auto text-red-500" />
                      </td>
                      <td className="p-4 text-center">1 (60 segundos)</td>
                      <td className="p-4 text-center">1 (60 segundos)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        Duración
                      </td>
                      <td className="p-4 text-center">2 meses</td>
                      <td className="p-4 text-center">3 meses</td>
                      <td className="p-4 text-center">6 meses</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        Soporte por consultas
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-4 w-4 mx-auto text-red-500" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="h-4 w-4 mx-auto text-blue-500" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="h-4 w-4 mx-auto text-amber-500" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        Descuento en ferias
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-4 w-4 mx-auto text-red-500" />
                      </td>
                      <td className="p-4 text-center">25% descuento</td>
                      <td className="p-4 text-center">25% descuento</td>
                    </tr>
                    <tr>
                      <td className="p-4 flex items-center">
                        <Check className="h-4 w-4 mr-2 text-muted-foreground" />
                        Anuncio destacado
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-4 w-4 mx-auto text-red-500" />
                      </td>
                      <td className="p-4 text-center">1 semana</td>
                      <td className="p-4 text-center">1 semana</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 flex items-center">
                        <Megaphone className="h-4 w-4 mr-2 text-muted-foreground" />
                        Promoción en redes sociales
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-4 w-4 mx-auto text-red-500" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-4 w-4 mx-auto text-red-500" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="h-4 w-4 mx-auto text-amber-500" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Method Section */}
        <section className="py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="bg-muted/30 rounded-lg p-6 border">
                <h2 className="text-2xl font-bold mb-4">Método de pago</h2>
                
                {/* Annual Billing Toggle */}
                {selectedPlan && (
                  <div className="flex items-center justify-between p-3 mb-4 bg-background rounded border">
                    <div>
                      <h3 className="font-medium">Facturación anual</h3>
                      <p className="text-sm text-muted-foreground">Ahorra un 15% con facturación anual</p>
                    </div>
                    <Switch
                      checked={isAnnualBilling}
                      onCheckedChange={setIsAnnualBilling}
                    />
                  </div>
                )}

                {selectedPlan && (
                  <div className="bg-background rounded-lg p-6 border mb-6">
                    <h3 className="text-lg font-medium mb-4">Detalles del pago</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Plan seleccionado:</span>
                        <Badge className={
                          selectedPlan === "basica" 
                            ? "bg-green-500" 
                            : selectedPlan === "gold" 
                              ? "bg-amber-500" 
                              : "bg-blue-500"
                        }>
                          {selectedPlan === "basica" 
                            ? "Básico" 
                            : selectedPlan === "gold" 
                              ? "Premium Gold" 
                              : "Premium"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Importe:</span>
                        <span className="font-medium">
                          {selectedPlan === "basica"
                            ? isAnnualBilling ? "51 € / año" : "5 € / mes"
                            : selectedPlan === "gold"
                              ? isAnnualBilling ? "255 € / año" : "25 € / 6 meses"
                              : isAnnualBilling ? "102 € / año" : "10 € / mes"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Duración del anuncio:</span>
                        <span className="font-medium">
                          {selectedPlan === "basica"
                            ? "2 meses"
                            : selectedPlan === "gold"
                              ? "6 meses"
                              : "3 meses"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total a pagar:</span>
                        <span className="font-bold text-lg">
                          {selectedPlan === "basica"
                            ? isAnnualBilling ? "51 €" : "5 €"
                            : selectedPlan === "gold"
                              ? isAnnualBilling ? "255 €" : "25 €"
                              : isAnnualBilling ? "102 €" : "10 €"}
                          {isAnnualBilling && <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">-15%</span>}
                        </span>
                      </div>
                      <Separator />

                      {/* Payment Methods */}
                      <div className="pt-4">
                        <h4 className="font-medium mb-3">Selecciona un método de pago:</h4>
                        <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="gap-4">
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="bizum" id="bizum" />
                            <Label htmlFor="bizum" className="flex items-center cursor-pointer">
                              <Phone className="h-5 w-5 mr-2 text-blue-600" />
                              <span>Bizum</span>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-5 w-5 mr-2 text-[#00457C]"
                              >
                                <path d="M7.074 21.427c.726 0 1.32-.262 1.787-.785.425-.492.638-1.11.638-1.856 0-.316-.035-.632-.106-.948-.07-.316-.176-.597-.317-.843-.14-.246-.328-.444-.563-.597-.235-.152-.52-.228-.854-.228-.828 0-1.524.29-2.087.87-.563.58-.844 1.324-.844 2.232 0 .316.035.632.106.948.07.316.176.597.317.843.14.246.328.444.563.597.235.152.52.228.854.228zm7.313-11.32c-.035-.188-.106-.376-.212-.563-.106-.188-.283-.34-.53-.457-.246-.117-.53-.176-.854-.176-.39 0-.745.07-1.062.211-.316.14-.58.34-.786.597-.205.257-.357.538-.456.843-.1.305-.15.597-.15.87 0 .389.07.744.212.965.14.305.352.526.637.667.282.14.6.211.953.211.07 0 .176 0 .282-.035l.247-.07c.035-.035.106-.07.176-.14l.177-.14c.637-.492 1.028-1.02 1.19-1.583zm-1.752 1.653c-.035.035-.07.07-.105.105-.106.106-.212.176-.317.212-.106.035-.212.07-.317.07-.282 0-.53-.07-.745-.211-.21-.14-.39-.34-.529-.597-.14-.257-.21-.538-.21-.843s.07-.58.21-.843c.14-.262.317-.475.53-.637.21-.163.456-.246.744-.246.355 0 .672.117.954.352.282.235.424.544.424.921 0 .21-.036.423-.106.636-.07.211-.176.389-.317.53zm4.184-1.583c-.035-.188-.106-.376-.212-.563-.106-.188-.282-.34-.53-.457-.246-.117-.53-.176-.854-.176-.39 0-.745.07-1.062.211-.316.14-.58.34-.786.597-.206.257-.357.538-.457.843-.1.305-.15.597-.15.87 0 .389.07.744.212.965.14.305.352.526.637.667.282.14.6.211.953.211.07 0 .176 0 .282-.035l.247-.07c.035-.035.106-.07.176-.14l.177-.14c.637-.492 1.028-1.02 1.19-1.583zm-1.752 1.653c-.035.035-.07.07-.106.105-.105.106-.21.176-.316.212-.106.035-.212.07-.317.07-.282 0-.53-.07-.744-.211-.211-.14-.39-.34-.53-.597-.14-.257-.21-.538-.21-.843s.07-.58.21-.843c.14-.262.317-.475.53-.637.21-.163.456-.246.744-.246.355 0 .672.117.953.352.282.235.425.544.425.921 0 .21-.036.423-.106.636-.071.211-.176.389-.317.53zm-7.77 8.93c-.247-.152-.459-.352-.637-.597s-.282-.526-.317-.843c-.035-.316-.035-.632-.035-.948 0-.908.282-1.652.844-2.232.563-.58 1.259-.87 2.087-.87.334 0 .62.076.854.228.235.152.423.351.563.597.14.246.246.527.317.843.07.316.105.632.105.948 0 .908-.282 1.652-.844 2.232-.563.58-1.259.87-2.087.87-.334 0-.62-.076-.854-.228zm11.02-12.063c-.39-.035-.78-.035-1.17-.035-1.878 0-3.403.563-4.574 1.689-1.17 1.126-1.753 2.642-1.753 4.546 0 1.306.317 2.436.953 3.39.317.492.745.877 1.286 1.158l-.457 1.82c-.035.152-.035.268.035.351.036.084.14.126.317.126h1.51c.176 0 .282-.042.317-.126l.07-.283c.106-.423.212-.843.317-1.26.106-.418.176-.799.212-1.144.282.07.563.105.844.105 1.913 0 3.458-.597 4.639-1.79 1.182-1.192 1.773-2.773 1.773-4.744 0-1.094-.21-2.087-.637-2.98-.424-.892-1.06-1.61-1.913-2.147-.853-.538-1.846-.807-2.978-.807zm-1.404 7.807c-.282-.14-.495-.352-.637-.637-.14-.282-.21-.597-.21-.953s.07-.67.21-.953c.14-.282.355-.495.637-.637.282-.14.597-.21.953-.21.355 0 .672.07.953.21.282.14.496.355.638.637.14.282.21.597.21.953s-.07.671-.21.953c-.14.282-.356.495-.638.637-.281.14-.598.21-.953.21-.356 0-.671-.07-.953-.21zM2.2 2H17.8C19.015 2 20 2.985 20 4.2V5H4C2.895 5 2 5.895 2 7V17C2 18.105 2.895 19 4 19H5V19.8C5 21.015 4.015 22 2.8 22H2.2C0.985 22 0 21.015 0 19.8V4.2C0 2.985 0.985 2 2.2 2Z"/>
                              </svg>
                              <span className="text-sm font-medium">PayPal</span>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="transfer" id="transfer" />
                            <Label htmlFor="transfer" className="flex items-center cursor-pointer">
                              <Building className="h-5 w-5 mr-2 text-gray-600" />
                              <span>Transferencia bancaria</span>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="subscription" id="subscription" />
                            <Label htmlFor="subscription" className="flex items-center cursor-pointer">
                              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                              <span>Tarjeta de crédito/débito</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Payment Instructions based on selected method */}
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                          <div>
                            {paymentMethod === "bizum" && (
                              <p className="text-sm text-amber-800">
                                Para completar tu pago, realiza una transferencia por Bizum al número{" "}
                                <strong>644 314 978</strong> con el concepto{" "}
                                <strong>
                                  "Anuncio{" "}
                                  {selectedPlan === "basica"
                                    ? "Básico"
                                    : selectedPlan === "gold"
                                      ? "Premium Gold"
                                      : "Premium"}
                                  {isAnnualBilling ? " Anual" : ""}
                                </strong>
                              </p>
                            )}
                            {paymentMethod === "paypal" && (
                              <p className="text-sm text-amber-800">
                                Serás redirigido a PayPal para completar el pago de{" "}
                                <strong>
                                  {selectedPlan === "basica" ? 
                                    (isAnnualBilling ? "51 €" : "5 €") 
                                    : selectedPlan === "gold" ? 
                                      (isAnnualBilling ? "255 €" : "25 €")
                                      : (isAnnualBilling ? "102 €" : "10 €")}
                                </strong>{" "}
                                al confirmar.
                              </p>
                            )}
                            {paymentMethod === "transfer" && (
                              <p className="text-sm text-amber-800">
                                Realiza una transferencia bancaria a la siguiente cuenta:
                                <br />
                                <strong>IBAN: ES05 1583 0001 1191 9706 5127</strong>
                                <br />
                                <strong>Beneficiario: Directorio Latinos SL</strong>
                                <br />
                                <strong>
                                  Concepto: Anuncio{" "}
                                  {selectedPlan === "basica"
                                    ? "Básico"
                                    : selectedPlan === "gold"
                                      ? "Premium Gold"
                                      : "Premium"}{" "}
                                  {isAnnualBilling ? "Anual" : ""} - Tu nombre
                                </strong>
                                <br />
                                Importe:{" "}
                                <strong>
                                  {selectedPlan === "basica" ? 
                                    (isAnnualBilling ? "51 €" : "5 €") 
                                    : selectedPlan === "gold" ? 
                                      (isAnnualBilling ? "255 €" : "25 €")
                                      : (isAnnualBilling ? "102 €" : "10 €")}
                                </strong>
                              </p>
                            )}
                            {paymentMethod === "subscription" && (
                              <p className="text-sm text-amber-800">
                                Se realizará un cargo de{" "}
                                <strong>
                                  {selectedPlan === "basica" ? 
                                    (isAnnualBilling ? "51 € / año" : "5 € / mes") 
                                    : selectedPlan === "gold" ? 
                                      (isAnnualBilling ? "255 € (pago único por 1 año)" : "25 € (pago único por 6 meses)")
                                      : (isAnnualBilling ? "102 € / año" : "10 € / mes")}
                                </strong>{" "}
                                a tu tarjeta. Puedes cancelar la suscripción en cualquier momento desde tu perfil.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlan && !paymentConfirmed ? (
                  <div className="space-y-6">
                    
                    {(paymentMethod === "subscription" || paymentMethod === "paypal") && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0" />
                            <div>
                              <p className="text-sm text-blue-800">
                                Al hacer clic en "Proceder al pago", serás redirigido a nuestra plataforma de pago seguro para completar la suscripción.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}


     
                    {((paymentMethod === "bizum" || paymentMethod === "transfer") || 
                       ((paymentMethod === "paypal" || paymentMethod === "subscription") && externalPaymentInitiated)) && (
   /*                    <div className="space-y-4">
                        <Label htmlFor="payment-proof">Comprobante de pago (opcional)</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Input id="payment-proof" type="file" className="hidden" onChange={handleFileChange} />
                          <Label htmlFor="payment-proof" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                              <span className="text-sm font-medium mb-1">
                                {paymentProof
                                  ? paymentProof.name
                                  : `Subir comprobante de ${paymentMethod === "bizum" ? "Bizum" : "transferencia"}`}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Arrastra y suelta o haz clic para seleccionar
                              </span>
                            </div>
                          </Label>
                        </div>
                      </div> */
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-6">
                      <div className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <div>
                          <p className="text-sm text-green-800">
                            Para activar más rapido el plan elegido, envíanos el justificante de transferencia a <a href="mailto:info@directoriolatinos.com" className="text-green-800 underline">info@directoriolatinos.com</a> y pulsa el botón "He realizado el pago".
                          </p>
                        </div>
                      </div>
                    </div>

                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full" disabled={paymentConfirmed}>
                          {paymentConfirmed
                            ? "Pago Confirmado"
                            : (paymentMethod === "paypal"|| paymentMethod === "subscription") && externalPaymentInitiated
                              ? "He realizado el pago"
                              : paymentMethod === "bizum" || paymentMethod === "transfer"
                                ? "He realizado el pago"
                                : "Proceder al pago"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar pago</AlertDialogTitle>
                          <AlertDialogDescription>
                            <span>
                              {(paymentMethod === "subscription" || paymentMethod === "paypal") && !externalPaymentInitiated
                                ? paymentMethod === "subscription"
                                  ? `¿Confirmas que deseas proceder con la suscripción del plan ${
                                      selectedPlan === "basica"
                                        ? "Básico"
                                        : selectedPlan === "gold"
                                          ? "Premium Gold"
                                          : "Premium"
                                    }? Serás redirigido a nuestra plataforma de pago seguro.`
                                  : "Serás redirigido a PayPal para completar el pago."
                                : `¿Has realizado el pago por ${
                                    paymentMethod === "bizum"
                                      ? "Bizum"
                                      : paymentMethod === "transferencia"
                                        ? "transferencia bancaria"
                                        : paymentMethod === "paypal"
                                          ? "PayPal"
                                          : "suscripción" // Default for subscription if externalPaymentInitiated is true
                                  }? Al confirmar, nuestro equipo verificará tu pago y activará tu anuncio lo antes posible.`}
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if ((paymentMethod === "subscription" || paymentMethod === "paypal") && !externalPaymentInitiated) {
                                // First step for subscription/paypal: redirect and set initiated flag
                                if (paymentMethod === "subscription") {
                                  if (selectedPlan === "basica") {
                                    window.open("https://checkout.revolut.com/pay/14122323-e9b3-47f2-8ca6-02b7fd3d3da5", "_blank", "noopener noreferrer");
                                  } else if (selectedPlan === "premium") {
                                    window.open("https://checkout.revolut.com/payment-link/0519d26a-d794-42bd-bb29-e7498a2726de", "_blank", "noopener noreferrer");
                                  } else if (selectedPlan === "gold") {
                                    window.open("https://checkout.revolut.com/payment-link/0519d26a-d794-42bd-bb29-e7498a2726de", "_blank", "noopener noreferrer"); // Using same link for now
                                  }
                                } else if (paymentMethod === "paypal") {
                                  // Placeholder for actual PayPal redirection or SDK integration
                                  if (selectedPlan === "basica") {
                                    window.open("https://checkout.revolut.com/pay/14122323-e9b3-47f2-8ca6-02b7fd3d3da5", "_blank", "noopener noreferrer");
                                  } else if (selectedPlan === "premium") {
                                    window.open("https://checkout.revolut.com/payment-link/0519d26a-d794-42bd-bb29-e7498a2726de", "_blank", "noopener noreferrer");
                                  } else if (selectedPlan === "gold") {
                                    window.open("https://checkout.revolut.com/payment-link/0519d26a-d794-42bd-bb29-e7498a2726de", "_blank", "noopener noreferrer"); // Using same link for now
                                  }
                                  console.log("Initiating PayPal payment process (placeholder)...");
                                  // Typically, you would redirect to PayPal or open a PayPal modal here.
                                }
                                setExternalPaymentInitiated(true);
                              } else {
                                // This is for:
                                // 1. Bizum or Transferencia (their only confirmation step)
                                // 2. PayPal or Subscription AFTER externalPaymentInitiated is true (their second confirmation step)
                                setPaymentConfirmed(true);
                              }
                            }}
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : selectedPlan && paymentConfirmed && !paymentSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">¡Confirmación Enviada!</h3>
                    <p className="text-green-700 mb-4">
                      {paymentMethod === "subscription"
                        ? "Hemos recibido tu confirmación de pago. Tu anuncio será activado en breve."
                        : paymentMethod === "paypal"
                          ? "Hemos recibido tu confirmación de pago. Tu anuncio será activado en breve."
                          : "Hemos recibido tu confirmación de pago. Tu anuncio será activado en breve."}
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/mis-anuncios">Ver mis anuncios</Link>
                    </Button>
                  </div>
                ) : selectedPlan && paymentSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">¡Suscripción Registrada!</h3>
                    <p className="text-green-700 mb-4">
                      Tu suscripción ha sido registrada con éxito. Recibirás un correo de confirmación cuando se valide el pago.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/mis-anuncios">Ver mis anuncios</Link>
                    </Button>
                  </div>
                ) : selectedPlan ? (
                  <div className="space-y-6 mt-6">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <div>
                          <p className="text-sm text-green-800">
                            Para activar tu plan, pulsa en "Realizar pago" y sigue las instrucciones.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handlePaymentConfirm}
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando
                        </>
                      ) : (
                        paymentMethod === "bizum" || paymentMethod === "transfer" 
                          ? "He realizado el pago" 
                          : "Realizar pago"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Selecciona un plan para continuar con el proceso de pago
                    </p>
                    <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                      Ver planes disponibles
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Preguntas frecuentes</h2>

              <Accordion type="single" collapsible className="bg-background rounded-lg border">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="px-4">¿Cómo se renueva mi suscripción?</AccordionTrigger>
                  <AccordionContent className="px-4">
                    <p>
                      Recibirás un correo electrónico 7 días antes de que finalice tu período de 3 meses con
                      instrucciones para renovar. Si no renuevas, tu anuncio se eliminará automáticamente al inicio del
                      4º mes.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="px-4">¿Puedo cambiar de plan durante mi suscripción?</AccordionTrigger>
                  <AccordionContent className="px-4">
                    <p>
                      Sí, puedes actualizar de plan Básico a Premium en cualquier momento pagando la diferencia
                      proporcional al tiempo restante. Para hacerlo, contacta con nuestro equipo de soporte.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="px-4">¿Cuánto tiempo tarda en activarse mi anuncio?</AccordionTrigger>
                  <AccordionContent className="px-4">
                    <p>
                      Una vez confirmado el pago, tu anuncio se activará en un plazo máximo de 24 horas, aunque
                      generalmente es mucho más rápido (1-2 horas en horario laboral).
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="px-4">¿Puedo publicar más de un anuncio?</AccordionTrigger>
                  <AccordionContent className="px-4">
                    <p>
                      Sí, cada suscripción te permite publicar un anuncio. Si deseas publicar más anuncios, deberás
                      contratar suscripciones adicionales, una por cada anuncio.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="px-4">¿Qué métodos de pago aceptan?</AccordionTrigger>
                  <AccordionContent className="px-4">
                    <p>
                      Aceptamos pagos a través de Bizum, PayPal, transferencia bancaria y suscripción automática con
                      tarjeta de crédito o débito.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
        {/* Hero Section */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex flex-wrap justify-center gap-3">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors font-medium px-3 py-1.5"
                >
                  Publicación inmediata
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors font-medium px-3 py-1.5"
                >
                  Visibilidad garantizada
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 transition-colors font-medium px-3 py-1.5"
                >
                  Soporte personalizado
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
      {/* Payment confirmation and processing section */}
      {paymentMethod !== "subscription" && (
        <AlertDialog open={paymentConfirmed && !paymentSuccess} onOpenChange={setPaymentConfirmed}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar pago</AlertDialogTitle>
              {isSubmitting ? (
                <div className="py-4">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="mt-2">Procesando tu pago...</span>
                  </div>
                </div>
              ) : (
                <AlertDialogDescription>
                  <span className="block">¿Has realizado el pago para el plan {selectedPlan === "basica" ? "Básico" : selectedPlan === "premium" ? "Premium" : "Premium Gold"}?</span>
                  <span className="block mt-2">Al confirmar, registraremos tu suscripción como pendiente de validación.</span>
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={async (e) => {
                  e.preventDefault();
                  console.log('[DEBUG] Payment confirmation button clicked');
                  await saveSubscription();
                }} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : "He realizado el pago"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {/* Payment Success Dialog */}
      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¡Pago recibido!</DialogTitle>
            <DialogDescription>
              Tu suscripción ha sido registrada y está pendiente de validación.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Te notificaremos cuando tu suscripción haya sido validada y activada.</p>
          <DialogFooter className="sm:justify-center">
            <Button 
              variant="default" 
              onClick={() => {
                setPaymentSuccess(false);
                router.push("/mis-anuncios");
              }}
            >
              Ver mis anuncios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar sesión requerido</DialogTitle>
            <DialogDescription>
              Debes iniciar sesión para continuar con el pago y activar los beneficios de tu suscripción.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 py-4">
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/auth/login?redirect=${encodeURIComponent('/tienda')}`)
              }}
            >
              Iniciar sesión
            </Button>
            <Button
              variant="default"
              onClick={() => {
                router.push(`/auth/register?redirect=${encodeURIComponent('/tienda')}`)
              }}
            >
              Registrarme
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* External payment reminder for subscription payment method */}
      {paymentMethod === "subscription" && externalPaymentInitiated && (
        <Dialog open={true} onOpenChange={() => setExternalPaymentInitiated(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Completaste tu pago?</DialogTitle>
              <DialogDescription>
                Si has completado tu pago con tarjeta, confirma para registrar tu suscripción.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExternalPaymentInitiated(false)}>Aún no</Button>
              <Button onClick={saveSubscription} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando
                  </>
                ) : "Sí, he pagado"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
