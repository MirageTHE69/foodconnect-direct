import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MultiImageUpload } from '@/components/shared/MultiImageUpload';
import { FileUpload } from '@/components/registration/FileUpload';
import type { UserType } from './UserTypeSelector';

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Chandigarh', 'Puducherry', 'Lakshadweep', 'Andaman and Nicobar Islands',
];

export interface RegistrationData {
  user_type: UserType;
  company_name: string;
  full_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  google_location: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  gst_number: string;
  gst_verified: boolean;
  fssai_number: string;
  product_description: string;
  contact_person_name: string;
  contact_designation: string;
  contact_phone: string;
  moq: string;
  horeca_category: string;
  menu_description: string;
  preferred_franchise_location: string;
  franchise_category: string;
  qualification: string;
  years_experience: string;
  job_category: string;
  preferred_city: string;
  uploaded_photos: string[];
  menu_upload_url: string;
  cv_url: string;
  passport_photo_url: string;
  aadhar_front_url: string;
  aadhar_back_url: string;
  terms_accepted: boolean;
  // B2B-specific fields
  b2b_category: string;
  private_label: string;
  export_capability: string;
  logistics_support: string;
  pricing_tier: string;
  certifications_text: string;
}

const initialData = (userType: UserType): RegistrationData => ({
  user_type: userType,
  company_name: '', full_name: '', address: '', city: '', state: '', country: 'India',
  google_location: '', phone: '', whatsapp: '', email: '', website: '',
  gst_number: '', gst_verified: false, fssai_number: '',
  product_description: '', contact_person_name: '', contact_designation: '', contact_phone: '',
  moq: '', horeca_category: '', menu_description: '',
  preferred_franchise_location: '', franchise_category: '',
  qualification: '', years_experience: '', job_category: '', preferred_city: '',
  uploaded_photos: [], menu_upload_url: '', cv_url: '', passport_photo_url: '',
  aadhar_front_url: '', aadhar_back_url: '', terms_accepted: false,
});

interface RegistrationFormProps {
  userType: UserType;
  onSubmit: (data: RegistrationData) => void;
  isLoading?: boolean;
}

export function RegistrationForm({ userType, onSubmit, isLoading }: RegistrationFormProps) {
  const [data, setData] = useState<RegistrationData>(initialData(userType));
  const [gstStatus, setGstStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof RegistrationData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const isB2BorB2C = userType === 'b2b' || userType === 'b2c';
  const isHoReCa = userType === 'horeca';
  const isFranchise = userType === 'franchise';
  const isRecruitment = userType === 'recruitment';

  const validateGST = (value: string) => {
    set('gst_number', value.toUpperCase());
    if (!value) { setGstStatus('idle'); set('gst_verified', false); return; }
    const valid = GST_REGEX.test(value.toUpperCase());
    setGstStatus(valid ? 'valid' : 'invalid');
    set('gst_verified', valid);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    
    if (!isRecruitment && !data.company_name.trim()) e.company_name = 'Required';
    if (isRecruitment && !data.full_name.trim()) e.full_name = 'Required';
    if (!data.address.trim()) e.address = 'Required';
    if (!data.city.trim()) e.city = 'Required';
    if (!data.state) e.state = 'Required';
    if (!data.phone.trim()) e.phone = 'Required';
    if (!data.email.trim()) e.email = 'Required';
    if (data.gst_number && gstStatus === 'invalid') e.gst_number = 'Invalid GST number';
    if (isHoReCa && !data.horeca_category) e.horeca_category = 'Required';
    if (!data.terms_accepted) e.terms_accepted = 'You must accept the Terms and Conditions';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(data);
  };

  const fieldClass = (field: string) => errors[field] ? 'border-destructive' : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business / Personal Info */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground border-b pb-2">
          {isRecruitment ? 'Personal Information' : 'Business Information'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isRecruitment && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Company Name *</Label>
              <Input value={data.company_name} onChange={e => set('company_name', e.target.value)} className={fieldClass('company_name')} placeholder="Your company name" />
              {errors.company_name && <p className="text-xs text-destructive">{errors.company_name}</p>}
            </div>
          )}
          {isRecruitment && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full Name *</Label>
              <Input value={data.full_name} onChange={e => set('full_name', e.target.value)} className={fieldClass('full_name')} placeholder="Your full name" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address *</Label>
            <Textarea value={data.address} onChange={e => set('address', e.target.value)} className={fieldClass('address')} placeholder="Full address" rows={2} />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>City *</Label>
            <Input value={data.city} onChange={e => set('city', e.target.value)} className={fieldClass('city')} placeholder="City" />
            {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>State *</Label>
            <Select value={data.state} onValueChange={v => set('state', v)}>
              <SelectTrigger className={fieldClass('state')}><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input value={data.country} onChange={e => set('country', e.target.value)} placeholder="India" />
          </div>
          <div className="space-y-1.5">
            <Label>Google Location</Label>
            <Input value={data.google_location} onChange={e => set('google_location', e.target.value)} placeholder="Google Maps link" />
          </div>

          {isHoReCa && (
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={data.horeca_category} onValueChange={v => set('horeca_category', v)}>
                <SelectTrigger className={fieldClass('horeca_category')}><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                  <SelectItem value="Café">Café</SelectItem>
                  <SelectItem value="Catering">Catering</SelectItem>
                </SelectContent>
              </Select>
              {errors.horeca_category && <p className="text-xs text-destructive">{errors.horeca_category}</p>}
            </div>
          )}

          {isFranchise && (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={data.franchise_category} onChange={e => set('franchise_category', e.target.value)} placeholder="Franchise category" />
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground border-b pb-2">Contact Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Phone Number *</Label>
            <Input value={data.phone} onChange={e => set('phone', e.target.value)} className={fieldClass('phone')} placeholder="+91 XXXXX XXXXX" />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <Input value={data.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label>Email Address *</Label>
            <Input type="email" value={data.email} onChange={e => set('email', e.target.value)} className={fieldClass('email')} placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          {!isRecruitment && (
            <div className="space-y-1.5">
              <Label>Website URL</Label>
              <Input value={data.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
            </div>
          )}
        </div>
      </div>

      {/* Business Details (non-recruitment) */}
      {!isRecruitment && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Business Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>GST Number {isFranchise ? '(Optional)' : ''}</Label>
              <div className="relative">
                <Input
                  value={data.gst_number}
                  onChange={e => validateGST(e.target.value)}
                  className={fieldClass('gst_number')}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
                {gstStatus === 'valid' && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                {gstStatus === 'invalid' && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />}
              </div>
              {gstStatus === 'invalid' && <p className="text-xs text-destructive">Invalid GST number</p>}
            </div>
            <div className="space-y-1.5">
              <Label>FSSAI Number</Label>
              <Input value={data.fssai_number} onChange={e => set('fssai_number', e.target.value)} placeholder="FSSAI License Number" />
            </div>

            {(isB2BorB2C || isFranchise) && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Product Description</Label>
                <Textarea value={data.product_description} onChange={e => set('product_description', e.target.value)} placeholder="Describe your products..." rows={3} />
              </div>
            )}

            {isHoReCa && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Menu Description</Label>
                <Textarea value={data.menu_description} onChange={e => set('menu_description', e.target.value)} placeholder="Describe your menu offerings..." rows={3} />
              </div>
            )}

            {isB2BorB2C && (
              <div className="space-y-1.5">
                <Label>Minimum Order Quantity (MOQ)</Label>
                <Input value={data.moq} onChange={e => set('moq', e.target.value)} placeholder="e.g., 100 units" />
              </div>
            )}

            {isFranchise && (
              <div className="space-y-1.5">
                <Label>Preferred Franchise Location</Label>
                <Input value={data.preferred_franchise_location} onChange={e => set('preferred_franchise_location', e.target.value)} placeholder="Preferred city/area" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Person (non-recruitment) */}
      {!isRecruitment && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Contact Person</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Contact Person Name</Label>
              <Input value={data.contact_person_name} onChange={e => set('contact_person_name', e.target.value)} placeholder="Name" />
            </div>
            {!isFranchise && (
              <div className="space-y-1.5">
                <Label>Designation</Label>
                <Input value={data.contact_designation} onChange={e => set('contact_designation', e.target.value)} placeholder="e.g., Manager" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Contact Phone Number</Label>
              <Input value={data.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
        </div>
      )}

      {/* Recruitment-specific fields */}
      {isRecruitment && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Professional Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Qualification</Label>
              <Input value={data.qualification} onChange={e => set('qualification', e.target.value)} placeholder="Your qualification" />
            </div>
            <div className="space-y-1.5">
              <Label>Years of Experience</Label>
              <Input value={data.years_experience} onChange={e => set('years_experience', e.target.value)} placeholder="e.g., 5" />
            </div>
            <div className="space-y-1.5">
              <Label>Job Category</Label>
              <Input value={data.job_category} onChange={e => set('job_category', e.target.value)} placeholder="e.g., Chef, Manager" />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred City</Label>
              <Input value={data.preferred_city} onChange={e => set('preferred_city', e.target.value)} placeholder="Preferred work city" />
            </div>
          </div>
        </div>
      )}

      {/* File Uploads */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground border-b pb-2">Documents & Photos</h4>
        <div className="space-y-4">
          {!isRecruitment && (
            <div className="space-y-1.5">
              <Label>Upload Photos</Label>
              <MultiImageUpload
                bucket="registration_files"
                currentImages={data.uploaded_photos}
                maxImages={5}
                onImagesChange={urls => set('uploaded_photos', urls)}
              />
            </div>
          )}

          {isHoReCa && (
            <FileUpload
              userId={null}
              label="Upload Menu"
              accept=".pdf,.jpg,.jpeg,.png"
              currentUrl={data.menu_upload_url}
              onUpload={url => set('menu_upload_url', url)}
              onRemove={() => set('menu_upload_url', '')}
            />
          )}

          {isRecruitment && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUpload
                  userId={null}
                  label="Upload Aadhar Front"
                  accept="image/*"
                  currentUrl={data.aadhar_front_url}
                  onUpload={url => set('aadhar_front_url', url)}
                  onRemove={() => set('aadhar_front_url', '')}
                />
                <FileUpload
                  userId={null}
                  label="Upload Aadhar Back"
                  accept="image/*"
                  currentUrl={data.aadhar_back_url}
                  onUpload={url => set('aadhar_back_url', url)}
                  onRemove={() => set('aadhar_back_url', '')}
                />
              </div>
              <FileUpload
                userId={null}
                label="Upload CV"
                accept=".pdf,.doc,.docx"
                currentUrl={data.cv_url}
                onUpload={url => set('cv_url', url)}
                onRemove={() => set('cv_url', '')}
              />
              <FileUpload
                userId={null}
                label="Upload Passport Size Photo"
                accept="image/*"
                currentUrl={data.passport_photo_url}
                onUpload={url => set('passport_photo_url', url)}
                onRemove={() => set('passport_photo_url', '')}
              />
            </>
          )}

          {isFranchise && (
            <div className="space-y-1.5">
              <Label>Upload Photos</Label>
              <MultiImageUpload
                bucket="registration_files"
                currentImages={data.uploaded_photos}
                maxImages={5}
                onImagesChange={urls => set('uploaded_photos', urls)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={data.terms_accepted}
            onCheckedChange={(checked) => set('terms_accepted', !!checked)}
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
            I have read and agree to the <a href="/terms-and-conditions" target="_blank" className="text-primary underline">Terms and Conditions</a>.
          </label>
        </div>
        {errors.terms_accepted && <p className="text-xs text-destructive">{errors.terms_accepted}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={!data.terms_accepted || isLoading}>
        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
      </Button>
    </form>
  );
}
