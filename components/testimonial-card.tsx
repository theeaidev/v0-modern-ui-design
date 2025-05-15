import Image from "next/image"
import type { ReactNode } from "react"

interface TestimonialCardProps {
  name: string
  role: string
  category: string
  avatar: string
  rating: number
  text: string
  accentColor: string
  icon: ReactNode
}

export function TestimonialCard({
  name,
  role,
  category,
  avatar,
  rating,
  text,
  accentColor,
  icon,
}: TestimonialCardProps) {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden border bg-background transition-all hover:shadow-md">
      <div className={`p-6 ${accentColor} flex justify-center`}>
        <div className="text-primary opacity-80">{icon}</div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image src={avatar || "/placeholder.svg"} alt={name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-bold">{name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{role}</p>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{category}</span>
            </div>
          </div>
        </div>
        <div className="flex mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={i < rating ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-yellow-500"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
