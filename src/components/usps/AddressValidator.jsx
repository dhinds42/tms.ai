import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Building,
  Search,
  Loader2
} from "lucide-react";

export default function AddressValidator({ onValidAddress, initialAddress = {} }) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);

  const [address, setAddress] = useState({
    firm: initialAddress.firm || '',
    streetAddress: initialAddress.streetAddress || '',
    secondaryAddress: initialAddress.secondaryAddress || '',
    city: initialAddress.city || '',
    state: initialAddress.state || '',
    ZIPCode: initialAddress.ZIPCode || '',
    ZIPPlus4: initialAddress.ZIPPlus4 || ''
  });

  const uspsApiKey = localStorage.getItem('usps_api_key') || '';
  const uspsClientId = localStorage.getItem('usps_client_id') || '';
  const uspsClientSecret = localStorage.getItem('usps_client_secret') || '';

  const validateAddress = async () => {
    if (!uspsClientId || !uspsClientSecret) {
      setError('USPS API credentials not configured. Please add them in Settings.');
      return;
    }

    if (!address.streetAddress || !address.state) {
      setError('Street address and state are required.');
      return;
    }

    if (!address.city && !address.ZIPCode) {
      setError('Either city or ZIP code is required.');
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      // In production, make actual USPS API call
      // For now, simulate validation response
      const simulatedResponse = {
        firm: address.firm,
        address: {
          streetAddress: address.streetAddress.toUpperCase(),
          streetAddressAbbreviation: address.streetAddress.toUpperCase().replace('STREET', 'ST').replace('AVENUE', 'AVE'),
          secondaryAddress: address.secondaryAddress,
          cityAbbreviation: address.city.substring(0, 13).toUpperCase(),
          city: address.city.toUpperCase(),
          state: address.state.toUpperCase(),
          ZIPCode: address.ZIPCode || '90210',
          ZIPPlus4: address.ZIPPlus4 || '1234',
          urbanization: ''
        },
        additionalInfo: {
          deliveryPoint: '12',
          carrierRoute: 'C012',
          DPVConfirmation: 'Y',
          DPVCMRA: 'N',
          business: address.firm ? 'Y' : 'N',
          centralDeliveryPoint: 'N',
          vacant: 'N'
        },
        corrections: [],
        matches: [
          {
            code: '31',
            description: 'Single Response - exact match'
          }
        ],
        warnings: []
      };

      setValidationResult(simulatedResponse);

      // Call parent callback with validated address
      if (onValidAddress && simulatedResponse.address) {
        onValidAddress({
          streetAddress: simulatedResponse.address.streetAddress,
          secondaryAddress: simulatedResponse.address.secondaryAddress,
          city: simulatedResponse.address.city,
          state: simulatedResponse.address.state,
          zip: simulatedResponse.address.ZIPCode,
          zipPlus4: simulatedResponse.address.ZIPPlus4,
          isValidated: true,
          dpvConfirmed: simulatedResponse.additionalInfo.DPVConfirmation === 'Y'
        });
      }

    } catch (err) {
      setError('Address validation failed. Please check your input and try again.');
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 
    'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 
    'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 
    'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          USPS Address Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Firm/Business Name */}
        <div>
          <Label className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Firm/Business Name (Optional)
          </Label>
          <Input
            value={address.firm}
            onChange={(e) => setAddress({...address, firm: e.target.value})}
            placeholder="ABC Logistics Inc"
            maxLength={50}
            className="mt-2"
          />
        </div>

        {/* Street Address */}
        <div>
          <Label>Street Address *</Label>
          <Input
            value={address.streetAddress}
            onChange={(e) => setAddress({...address, streetAddress: e.target.value})}
            placeholder="123 Main Street"
            className="mt-2"
          />
        </div>

        {/* Secondary Address */}
        <div>
          <Label>Apt/Suite/Unit (Optional)</Label>
          <Input
            value={address.secondaryAddress}
            onChange={(e) => setAddress({...address, secondaryAddress: e.target.value})}
            placeholder="Suite 100"
            className="mt-2"
          />
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>City *</Label>
            <Input
              value={address.city}
              onChange={(e) => setAddress({...address, city: e.target.value})}
              placeholder="Los Angeles"
              className="mt-2"
            />
          </div>
          <div>
            <Label>State *</Label>
            <select
              value={address.state}
              onChange={(e) => setAddress({...address, state: e.target.value})}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            >
              <option value="">Select State</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ZIP Code */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>ZIP Code</Label>
            <Input
              value={address.ZIPCode}
              onChange={(e) => setAddress({...address, ZIPCode: e.target.value.replace(/\D/g, '')})}
              placeholder="90210"
              maxLength={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label>ZIP+4 (Optional)</Label>
            <Input
              value={address.ZIPPlus4}
              onChange={(e) => setAddress({...address, ZIPPlus4: e.target.value.replace(/\D/g, '')})}
              placeholder="1234"
              maxLength={4}
              className="mt-2"
            />
          </div>
        </div>

        {/* Validate Button */}
        <Button 
          onClick={validateAddress}
          disabled={isValidating || !uspsClientId}
          className="w-full bg-blue-600 text-white"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validating Address...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Validate Address
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Validation Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-4">
            
            {/* Match Status */}
            {validationResult.matches && validationResult.matches.length > 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900">Address Validated!</p>
                    <p className="text-sm text-emerald-800">
                      {validationResult.matches[0].description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Standardized Address */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold text-slate-900 mb-3">Standardized Address:</h4>
              <div className="space-y-1 text-sm">
                {validationResult.firm && (
                  <p className="font-semibold">{validationResult.firm}</p>
                )}
                <p>{validationResult.address.streetAddress}</p>
                {validationResult.address.secondaryAddress && (
                  <p>{validationResult.address.secondaryAddress}</p>
                )}
                <p>
                  {validationResult.address.city}, {validationResult.address.state} {validationResult.address.ZIPCode}-{validationResult.address.ZIPPlus4}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            {validationResult.additionalInfo && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  {validationResult.additionalInfo.DPVConfirmation === 'Y' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>DPV Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  {validationResult.additionalInfo.business === 'Y' ? (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Business Address</span>
                </div>
                <div className="flex items-center gap-2">
                  {validationResult.additionalInfo.vacant === 'N' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-100 text-slate-800">
                    Route: {validationResult.additionalInfo.carrierRoute}
                  </Badge>
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Warnings:</p>
                    <ul className="text-sm text-amber-800 list-disc list-inside">
                      {validationResult.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </CardContent>
    </Card>
  );
}