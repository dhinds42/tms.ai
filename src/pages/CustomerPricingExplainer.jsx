import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DollarSign, Fuel, Package, Shield, TrendingUp, Calculator, FileText, CheckCircle } from "lucide-react";

export default function CustomerPricingExplainer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Understanding Your Freight Pricing
          </h1>
          <p className="text-slate-600 text-lg">
            Transparent, accurate, and fair pricing for every shipment
          </p>
          <Badge className="mt-3 bg-blue-600">Customer Guide</Badge>
        </div>

        {/* Overview */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">Our Pricing Commitment</h2>
                <p className="text-blue-800 leading-relaxed">
                  Every quote you receive is calculated using the same transparent formula, 
                  every time. Your pricing is based on distance, service type, and market conditions—not 
                  guesswork. We itemize charges so you know exactly what you're paying for.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Pricing Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              How Your Freight Rate Is Calculated
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Base Transportation Rate</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Calculated based on your specific lane (pickup to delivery). We use either:
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    <p className="ml-4">• <strong>Per-Mile Rate:</strong> $X per mile × distance</p>
                    <p className="ml-4">• <strong>Flat Rate:</strong> Fixed price for the entire lane</p>
                  </div>
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-900">
                      <strong>Example:</strong> Chicago to Dallas (925 miles) at $2.50/mile = $2,312.50
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Fuel Surcharge (if applicable)</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Adjusts for fluctuating diesel prices. See "Understanding Fuel Surcharges" below for details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Accessorial Charges (if applicable)</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Additional services like liftgate, inside delivery, or detention.
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    <p className="ml-4">• Liftgate service: typically $75-150</p>
                    <p className="ml-4">• Detention (if wait time exceeds free time): $25-50/hour</p>
                    <p className="ml-4">• Extra stops: varies by location</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  =
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-900 text-lg">Your Total Freight Charge</p>
                  <p className="text-sm text-green-800 mt-1">
                    Base Rate + Fuel Surcharge + Accessorials = <strong>Final Total</strong>
                  </p>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Understanding Fuel Surcharges */}
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-orange-600" />
              Understanding Fuel Surcharges (FSC)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            
            <p className="text-slate-700">
              Diesel fuel costs change weekly. The fuel surcharge helps cover these fluctuations 
              fairly for both you and the carrier. Here's how it works:
            </p>

            <Accordion type="single" collapsible className="w-full">
              
              <AccordionItem value="off">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-600">FSC OFF</Badge>
                    <span>Fuel Cost Included in Base Rate</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600">
                    Some lanes have fuel costs built into the base rate. You'll see a single line item 
                    for transportation with no separate fuel charge.
                  </p>
                  <div className="mt-3 p-3 bg-slate-50 rounded border text-xs">
                    <p className="font-semibold mb-1">Example Quote:</p>
                    <p>Transportation: $2,500</p>
                    <p className="font-bold mt-1">Total: $2,500</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="included">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600">FSC INCLUDED</Badge>
                    <span>Fuel Priced In (Not Listed Separately)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600">
                    Fuel costs are factored into your rate calculation, but we don't break them out 
                    as a separate line. Your quote shows one all-inclusive transportation charge.
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200 text-xs">
                    <p className="font-semibold mb-1">Example Quote:</p>
                    <p>Transportation (includes fuel): $2,600</p>
                    <p className="font-bold mt-1">Total: $2,600</p>
                    <p className="text-blue-700 italic mt-2">* Fuel surcharge included in rate</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="flat">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600">FSC SEPARATE - Flat Per Mile</Badge>
                    <span>Fuel Charged Per Mile</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 mb-3">
                    You pay a fixed amount per mile for fuel. Simple and predictable.
                  </p>
                  <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs space-y-1">
                    <p className="font-semibold">Example Quote:</p>
                    <p>Base Rate: $2.50/mile × 925 miles = $2,312.50</p>
                    <p>Fuel Surcharge: $0.12/mile × 925 miles = $111.00</p>
                    <p className="font-bold pt-2 border-t border-emerald-300">Total: $2,423.50</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="percent">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600">FSC SEPARATE - Percentage</Badge>
                    <span>Fuel as % of Base Rate</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 mb-3">
                    Fuel is calculated as a percentage of your base transportation cost. 
                    This scales with the shipment value.
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200 text-xs space-y-1">
                    <p className="font-semibold">Example Quote:</p>
                    <p>Base Rate: $2,312.50</p>
                    <p>Fuel Surcharge: 15% of $2,312.50 = $346.88</p>
                    <p className="font-bold pt-2 border-t border-purple-300">Total: $2,659.38</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="table">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-600">FSC SEPARATE - Table Lookup</Badge>
                    <span>Fuel Based on Current Diesel Price</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 mb-3">
                    We use the U.S. Department of Energy's national diesel average. 
                    Your fuel charge is determined by a pre-agreed table that adjusts 
                    based on current fuel prices.
                  </p>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200 text-xs space-y-2">
                    <p className="font-semibold">How It Works:</p>
                    <table className="w-full text-xs mt-2">
                      <thead>
                        <tr className="border-b border-orange-300">
                          <th className="text-left p-1">Diesel Price</th>
                          <th className="text-right p-1">FSC per Mile</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-1">$3.00 - $3.49</td><td className="text-right p-1">$0.10</td></tr>
                        <tr><td className="p-1">$3.50 - $3.99</td><td className="text-right p-1">$0.15</td></tr>
                        <tr><td className="p-1">$4.00 - $4.49</td><td className="text-right p-1">$0.20</td></tr>
                      </tbody>
                    </table>
                    <p className="text-orange-800 italic mt-2">
                      * Current diesel: $3.75 → FSC = $0.15/mi × 925 mi = $138.75
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

          </CardContent>
        </Card>

        {/* Reading Your Quote */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Reading Your Quote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <p className="font-bold text-slate-900">Quote #Q-2026-001</p>
                <Badge className="bg-green-600">Active</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Transportation</span>
                  <span className="font-semibold">$2,312.50</span>
                </div>
                <div className="flex justify-between text-orange-700">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    Fuel Surcharge (12¢/mi)
                  </span>
                  <span className="font-semibold">$111.00</span>
                </div>
                <div className="flex justify-between text-purple-700">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Liftgate Service
                  </span>
                  <span className="font-semibold">$75.00</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t-2 border-slate-300 text-lg">
                  <span className="font-bold text-slate-900">Total Freight Charge</span>
                  <span className="font-bold text-green-600">$2,498.50</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-semibold mb-2">💡 What You're Seeing</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Every charge is itemized and explained</li>
                <li>✓ No hidden fees or surprise charges</li>
                <li>✓ Your quote is valid for the dates shown</li>
              </ul>
            </div>

          </CardContent>
        </Card>

        {/* Why Invoice Might Differ */}
        <Card className="border-2 border-amber-200">
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Why Your Invoice Might Differ from the Quote
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            
            <p className="text-slate-700">
              In most cases, your invoice will match your quote exactly. However, if something 
              changes during shipment, we'll explain the difference clearly.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded border border-amber-200">
                <p className="font-semibold text-amber-900 text-sm mb-1">Common Reasons for Adjustments:</p>
                <ul className="text-sm text-amber-800 space-y-1 ml-4">
                  <li>• <strong>Detention charges</strong> - if the truck waited longer than the free time at pickup or delivery</li>
                  <li>• <strong>Weight adjustments</strong> - if actual weight differs from quote (verified by BOL)</li>
                  <li>• <strong>Additional stops</strong> - if you requested extra stops after the quote</li>
                  <li>• <strong>Fuel price change</strong> - if using fuel table and diesel price moved significantly</li>
                </ul>
              </div>

              <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                <p className="font-semibold text-emerald-900 text-sm mb-1">✓ How We Handle Changes:</p>
                <ul className="text-sm text-emerald-800 space-y-1 ml-4">
                  <li>• Every adjustment is itemized with explanation</li>
                  <li>• We show the original quote total for comparison</li>
                  <li>• Supporting documentation (BOL, photos) attached when applicable</li>
                  <li>• You can dispute any charge if documentation is unclear</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200 mt-4">
              <p className="font-bold text-slate-900 mb-3">Example Invoice with Variance:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Original Quote Total</span>
                  <span className="font-semibold">$2,498.50</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>+ Detention at Delivery (2 hours)</span>
                  <span className="font-semibold">$50.00</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-lg">
                  <span className="font-bold">Invoice Total</span>
                  <span className="font-bold text-green-600">$2,548.50</span>
                </div>
                <div className="bg-amber-100 border border-amber-300 rounded p-2 mt-2">
                  <p className="text-xs text-amber-900">
                    <strong>Variance:</strong> +$50.00 | <strong>Reason:</strong> Detention at delivery location (2 hours × $25/hr) - signed BOL attached
                  </p>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Transparency Guarantee */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Our Transparency & Accuracy Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <Shield className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-semibold text-green-900 mb-1">Consistent Pricing</p>
                <p className="text-sm text-green-800">
                  Same lane + same service = same price. Our pricing engine uses fixed formulas, 
                  not arbitrary markups.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-200">
                <Calculator className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-semibold text-green-900 mb-1">Itemized Breakdown</p>
                <p className="text-sm text-green-800">
                  Every charge explained. No bundled fees. You see exactly what you're paying for.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-200">
                <FileText className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-semibold text-green-900 mb-1">Quote-Invoice Match</p>
                <p className="text-sm text-green-800">
                  If anything changes, we show the variance and explain why. 
                  Disputes are rare because everything is documented.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-200">
                <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-semibold text-green-900 mb-1">Market-Based FSC</p>
                <p className="text-sm text-green-800">
                  Fuel surcharges based on published DOE diesel prices. 
                  You're never charged more than what carriers actually pay.
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              
              <AccordionItem value="faq1">
                <AccordionTrigger>Can I negotiate my freight rates?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-700">
                    Yes! Contract customers with consistent volume can negotiate custom lane rates and 
                    fuel surcharge tables. Contact your account manager to discuss volume-based pricing.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq2">
                <AccordionTrigger>How often do fuel surcharges change?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-700">
                    For table-based FSC, we update weekly based on DOE published diesel prices. 
                    For flat per-mile or percentage methods, the rate is fixed until your contract renews.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq3">
                <AccordionTrigger>What if I dispute a charge?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-700">
                    Submit a dispute within 30 days. We'll review with supporting documentation (BOL, photos, 
                    detention logs). Most disputes resolve within 5 business days. You'll receive a detailed 
                    explanation and, if valid, a credit or adjusted invoice.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq4">
                <AccordionTrigger>Can I see my pricing history?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-700">
                    Yes! Your customer portal shows all quotes, invoices, and lane rates. 
                    You can track pricing trends over time and export reports for your records.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq5">
                <AccordionTrigger>Are fuel surcharges negotiable?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-700">
                    For high-volume shippers, we can offer custom FSC tables or capped surcharges 
                    as part of a contract agreement. Standard spot shipments use our default FSC formula.
                  </p>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-indigo-900 text-lg mb-2">Questions About Your Pricing?</h3>
            <p className="text-indigo-800 mb-4">
              Our team is here to help explain any quote or invoice.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-indigo-600 text-white px-4 py-2">
                📧 support@tms.ai
              </Badge>
              <Badge className="bg-blue-600 text-white px-4 py-2">
                📞 1-800-FREIGHT
              </Badge>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}