import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useSupplierProfile } from '@/hooks/useSupplierProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle, Clock, XCircle, Save } from 'lucide-react';
import { getTierLabel, type Tier } from '@/lib/permissions';
import { INDIAN_STATES } from '@/lib/gst';
import { PlanStatusCard } from '@/components/shared/PlanStatusCard';

const BUSINESS_CATEGORIES: { value: Tier; label: string }[] =
  (['founders', 'women_enterprise', 'north_east_startups', 'micro_first_time', 'small_homemade_food'] as Tier[])
    .map((t) => ({ value: t, label: getTierLabel(t) }));

const CERTIFICATIONS = [
  'FSSAI Certified',
  'ISO 22000',
  'HACCP',
  'Organic Certified',
  'GMP Certified',
  'Halal Certified',
  'Kosher Certified',
  'BRC Certified',
];

export default function SupplierProfile() {
  const { profile, loading, saving, updateProfile } = useSupplierProfile();
  
  const [formData, setFormData] = useState({
    company_name: '',
    business_description: '',
    logo_url: '',
    cover_image_url: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: '',
    fssai_number: '',
    website: '',
    certifications: [] as string[],
    business_category: '' as Tier | '',
    contact_person_name: '',
    phone: '',
    email: '',
    moq: '',
    export_capability: '',
    manufacturing_capability: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        business_description: profile.business_description || '',
        logo_url: profile.logo_url || '',
        cover_image_url: profile.cover_image_url || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        gst_number: profile.gst_number || '',
        fssai_number: profile.fssai_number || '',
        website: profile.website || '',
        certifications: profile.certifications || [],
        business_category: (profile.business_category as Tier) || '',
        contact_person_name: profile.contact_person_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        moq: profile.moq || '',
        export_capability: profile.export_capability || '',
        manufacturing_capability: profile.manufacturing_capability || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      ...formData,
      business_category: formData.business_category || null,
    });
  };

  const handleCertificationToggle = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const getVerificationBadge = () => {
    if (!profile) return null;
    
    const status = profile.verification_status;
    const variants = {
      verified: { icon: CheckCircle, label: 'Verified', className: 'bg-green-500' },
      pending: { icon: Clock, label: 'Pending Verification', className: 'bg-yellow-500' },
      rejected: { icon: XCircle, label: 'Rejected', className: 'bg-red-500' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Business Profile</h1>
            <p className="text-muted-foreground">
              Complete your profile to get verified and attract more buyers
            </p>
          </div>
          {getVerificationBadge()}
        </div>

        <PlanStatusCard />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Images</CardTitle>
              <CardDescription>
                Upload your company logo and cover image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Company Logo</Label>
                  <ImageUpload
                    bucket="suppliers"
                    currentImageUrl={formData.logo_url}
                    onUploadComplete={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                    aspectRatio="logo"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Cover Image</Label>
                  <ImageUpload
                    bucket="suppliers"
                    currentImageUrl={formData.cover_image_url}
                    onUploadComplete={(url) => setFormData(prev => ({ ...prev, cover_image_url: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, cover_image_url: '' }))}
                    aspectRatio="cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Basic information about your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="business_category">Business Category</Label>
                  <Select
                    value={formData.business_category}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, business_category: v as Tier }))}
                  >
                    <SelectTrigger id="business_category" className="mt-1">
                      <SelectValue placeholder="Select your business category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Determines which category-credit subscription plans apply to you.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="business_description">Business Description</Label>
                  <Textarea
                    id="business_description"
                    value={formData.business_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
                    rows={4}
                    placeholder="Tell buyers about your business, products, and what makes you unique..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={formData.gst_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, gst_number: e.target.value }))}
                    placeholder="22AAAAA0000A1Z5"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fssai_number">FSSAI License Number</Label>
                  <Input
                    id="fssai_number"
                    value={formData.fssai_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, fssai_number: e.target.value }))}
                    placeholder="14 digit number"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.yourcompany.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>
                Your business location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="6 digit pincode"
                    maxLength={6}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Sourcing Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Sourcing Details</CardTitle>
              <CardDescription>
                Shown to buyers based on their subscription tier (contact info is credit-gated for most plans)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contact_person_name">Contact Person</Label>
                  <Input
                    id="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person_name: e.target.value }))}
                    placeholder="Mr/Ms Name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="business@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="moq">MOQ (Minimum Order Quantity)</Label>
                  <Input
                    id="moq"
                    value={formData.moq}
                    onChange={(e) => setFormData(prev => ({ ...prev, moq: e.target.value }))}
                    placeholder="e.g. 100 units"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturing_capability">Manufacturing Capability</Label>
                  <Input
                    id="manufacturing_capability"
                    value={formData.manufacturing_capability}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturing_capability: e.target.value }))}
                    placeholder="e.g. 10,000 units/month"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="export_capability">Export Capabilities</Label>
                  <Textarea
                    id="export_capability"
                    value={formData.export_capability}
                    onChange={(e) => setFormData(prev => ({ ...prev, export_capability: e.target.value }))}
                    rows={2}
                    placeholder="Countries you export to, certifications for export, etc."
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Select the certifications your business holds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {CERTIFICATIONS.map(cert => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      id={cert}
                      checked={formData.certifications.includes(cert)}
                      onCheckedChange={() => handleCertificationToggle(cert)}
                    />
                    <Label htmlFor={cert} className="text-sm font-normal cursor-pointer">
                      {cert}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
