"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Check, Upload, Clock, AlertCircle, Calendar, ImageIcon, Film, MessageCircle, Tag, X } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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

export default function TiendaPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0])
    }
  }

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan)
  }

  const handlePaymentConfirm = () => {
    setPaymentConfirmed(true)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                        Anuncio visible durante <strong>3 meses</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>
                        En el <strong>4º mes</strong>, si no se renueva, se elimina automáticamente
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>El pago inicial activa el anuncio de forma inmediata</span>
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
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <div className="h-10 w-0.5 bg-green-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 3</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-10 w-0.5 bg-red-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 4</span>
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
                        Anuncio visible durante <strong>3 meses</strong>
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
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <div className="h-10 w-0.5 bg-blue-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 1</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <div className="h-10 w-0.5 bg-blue-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 2</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <div className="h-10 w-0.5 bg-blue-500"></div>
                        <span className="text-xs text-muted-foreground mt-1">Mes 3</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-10 w-0.5 bg-red-500"></div>
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
            </div>
          </div>
        </section>

        {/* Comparison Table (Mobile Friendly) */}
        <section className="py-8 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-8">Comparativa de planes</h2>

            <div className="md:hidden">
              <Tabs defaultValue="basica">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basica">Básica</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
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
                        <span className="font-medium">3 meses</span>
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
                        <span className="font-medium">3 meses</span>
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
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop Comparison Table */}
            <div className="hidden md:block overflow-hidden rounded-lg border bg-background">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Características</th>
                    <th className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <Badge className="bg-green-500 text-white border-0 mb-1">Básica</Badge>
                        <span className="text-sm font-normal">5 € / mes</span>
                      </div>
                    </th>
                    <th className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <Badge className="bg-blue-500 text-white border-0 mb-1">Premium</Badge>
                        <span className="text-sm font-normal">10 € / mes</span>
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
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      Duración
                    </td>
                    <td className="p-4 text-center">3 meses</td>
                    <td className="p-4 text-center">3 meses</td>
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
                  </tr>
                  <tr>
                    <td className="p-4 flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      Descuento en ferias
                    </td>
                    <td className="p-4 text-center">
                      <X className="h-4 w-4 mx-auto text-red-500" />
                    </td>
                    <td className="p-4 text-center">25% descuento</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Payment Method Section */}
        <section className="py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="bg-muted/30 rounded-lg p-6 border">
                <h2 className="text-2xl font-bold mb-4">Método de pago</h2>

                <div className="flex items-start mb-6">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-blue-500"
                    >
                      <path
                        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="16" r="1" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">De momento, los pagos se realizan por Bizum</h3>
                    <p className="text-muted-foreground">
                      Una vez confirmado el pago, el anuncio se activa automáticamente por 3 meses.
                    </p>
                  </div>
                </div>

                {selectedPlan && (
                  <div className="bg-background rounded-lg p-6 border mb-6">
                    <h3 className="text-lg font-medium mb-4">Detalles del pago</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Plan seleccionado:</span>
                        <Badge className={selectedPlan === "basica" ? "bg-green-500" : "bg-blue-500"}>
                          {selectedPlan === "basica" ? "Básico" : "Premium"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Importe:</span>
                        <span className="font-medium">{selectedPlan === "basica" ? "5 €" : "10 €"} / mes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Duración:</span>
                        <span className="font-medium">3 meses</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total a pagar:</span>
                        <span className="font-bold text-lg">{selectedPlan === "basica" ? "15 €" : "30 €"}</span>
                      </div>
                      <Separator />
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                          <div>
                            <p className="text-sm text-amber-800">
                              Para completar tu pago, realiza una transferencia por Bizum al número{" "}
                              <strong>600 123 456</strong> con el concepto{" "}
                              <strong>"Anuncio {selectedPlan === "basica" ? "Básico" : "Premium"}"</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlan && !paymentConfirmed ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label htmlFor="payment-proof">Comprobante de pago (opcional)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Input id="payment-proof" type="file" className="hidden" onChange={handleFileChange} />
                        <Label htmlFor="payment-proof" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium mb-1">
                              {paymentProof ? paymentProof.name : "Subir comprobante de Bizum"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Arrastra y suelta o haz clic para seleccionar
                            </span>
                          </div>
                        </Label>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full">He realizado el pago</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar pago</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Has realizado el pago por Bizum? Al confirmar, nuestro equipo verificará tu pago y activará
                            tu anuncio lo antes posible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePaymentConfirm}>Confirmar pago</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : selectedPlan && paymentConfirmed ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">¡Pago confirmado!</h3>
                    <p className="text-green-700 mb-4">
                      Hemos recibido tu confirmación de pago. Tu anuncio será activado en breve.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/servicios">Ver anuncios</Link>
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
                      Actualmente solo aceptamos pagos a través de Bizum. Estamos trabajando para implementar más
                      métodos de pago en el futuro próximo, como tarjetas de crédito y PayPal.
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
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Directorio Latinos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                La plataforma líder para publicar y encontrar anuncios de servicios profesionales desde 2020.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/servicios" className="text-sm text-muted-foreground hover:text-foreground">
                    Servicios
                  </Link>
                </li>
                <li>
                  <Link href="/tienda" className="text-sm text-muted-foreground hover:text-foreground">
                    Tienda
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="text-sm text-muted-foreground hover:text-foreground">
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="text-sm text-muted-foreground hover:text-foreground">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary mt-0.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">+34 123 456 789</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary mt-0.5"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="m22 5-10 7L2 5" />
                  </svg>
                  <span className="text-sm text-muted-foreground">info@serviciosdirectorio.com</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Suscríbete</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Suscríbete a nuestras novedades y recibe alertas sobre nuevos anuncios en tu área.
              </p>
              <div className="flex gap-2">
                <Input placeholder="Tu email" className="max-w-[220px]" />
                <Button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Directorio Latinos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
