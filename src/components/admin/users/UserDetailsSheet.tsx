import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle2, ExternalLink, FileText, Loader2, Save } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/indianStates';
import type { SaveUserDetailsInput, UserWithRole } from '@/hooks/useAdminUsers';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type VerificationStatus = Database['public']['Enums']['verification_status'];
type Role = 'buyer' | 'supplier' | 'admin';

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;
const FSSAI_REGEX = /^\d{14}$/;
const AADHAR_REGEX = /^[2-9]\d{11}$/;

const USER_TYPES: { value: UserType; label: string }[] = [
  { value: 'b2b', label: 'B2B' },
  { value: 'b2c', label: 'B2C' },
  { value: 'horeca', label: 'HoReCa' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'recruitment', label: 'Recruitment (job seeker)' },
];

// Text columns of registration_profiles the admin can edit.
const REG_FIELDS = [
  'company_name', 'full_name', 'address', 'city', 'state', 'country', 'google_location',
  'phone', 'whatsapp', 'email', 'website', 'gst_number', 'fssai_number', 'aadhar_number',
  'product_description', 'contact_person_name', 'contact_designation', 'contact_phone',
  'moq', 'horeca_category', 'menu_description', 'preferred_franchise_location', 'franchise_category',
  'qualification', 'years_experience', 'job_category', 'preferred_city', 'b2b_category',
  'certifications_text',
] as const;
type RegField = typeof REG_FIELDS[number];

const SUP_FIELDS = [
  'company_name', 'phone', 'email', 'address', 'city', 'state', 'pincode', 'website', 'business_description',
] as const;
type SupField = typeof SUP_FIELDS[number];

type RegForm = Record<RegField, string>;
type SupForm = Record<SupField, string>;

const toForm = <K extends string>(keys: readonly K[], row: Record<string, unknown> | null): Record<K, string> =>
  Object.fromEntries(keys.map((k) => [k, row?.[k] == null ? '' : String(row[k])])) as Record<K, string>;

const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim());

interface Props {
  user: UserWithRole | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: SaveUserDetailsInput) => Promise<void>;
  saving: boolean;
  onRoleChange: (role: Role) => void;
  roleUpdating: boolean;
}

export function UserDetailsSheet({ user, onOpenChange, onSave, saving, onRoleChange, roleUpdating }: Props) {
  const [fullName, setFullName] = useState('');
  const [accountPhone, setAccountPhone] = useState('');
  const [userType, setUserType] = useState<UserType | ''>('');
  const [reg, setReg] = useState<RegForm>(() => toForm(REG_FIELDS, null));
  const [sup, setSup] = useState<SupForm>(() => toForm(SUP_FIELDS, null));
  const [verification, setVerification] = useState<VerificationStatus>('pending');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset the form whenever a different user (or fresh data for them) is shown.
  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name ?? '');
    setAccountPhone(user.phone ?? '');
    setUserType(user.registration?.user_type ?? '');
    setReg(toForm(REG_FIELDS, user.registration));
    // GST/FSSAI are edited once and saved to both tables, so fall back to the
    // supplier listing's values when the sign-up record has none -- otherwise
    // saving would blank them on the listing.
    setReg((r) => ({
      ...r,
      gst_number: r.gst_number || user.supplier?.gst_number || '',
      fssai_number: r.fssai_number || user.supplier?.fssai_number || '',
    }));
    setSup(toForm(SUP_FIELDS, user.supplier));
    setVerification(user.supplier?.verification_status ?? 'pending');
    setErrors({});
  }, [user]);

  const setR = (k: RegField, v: string) => {
    setReg((r) => ({ ...r, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };
  const setS = (k: SupField, v: string) => setSup((s) => ({ ...s, [k]: v }));

  const gst = reg.gst_number.trim().toUpperCase();
  const gstState = !gst ? 'empty' : GST_REGEX.test(gst) ? 'valid' : 'invalid';

  const regTouched = useMemo(() => {
    if (!user) return false;
    if (user.registration) return true;
    // For a supplier with no sign-up record, GST/FSSAI alone are saved to the
    // listing and don't need a new sign-up record.
    const taxOnListing = (k: RegField) => !!user.supplier && (k === 'gst_number' || k === 'fssai_number');
    return userType !== '' || REG_FIELDS.some((k) => !taxOnListing(k) && reg[k].trim() !== '');
  }, [user, userType, reg]);

  if (!user) return <Sheet open={false} onOpenChange={onOpenChange} />;

  const validate = () => {
    const e: Record<string, string> = {};
    if (gstState === 'invalid') e.gst_number = 'Not a valid GST number (15 characters, e.g. 24AAPFC8060R1ZQ)';
    if (reg.fssai_number.trim() && !FSSAI_REGEX.test(reg.fssai_number.trim())) e.fssai_number = 'FSSAI number must be 14 digits';
    const aadhar = reg.aadhar_number.replace(/\s/g, '');
    if (aadhar && !AADHAR_REGEX.test(aadhar)) e.aadhar_number = 'Aadhaar must be 12 digits';
    if (regTouched && !userType) e.user_type = 'Choose a user type to save these details';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const registration = regTouched
      ? {
          ...Object.fromEntries(REG_FIELDS.map((k) => [k, nullIfEmpty(reg[k])])),
          gst_number: gst || null,
          gst_verified: gstState === 'valid',
          aadhar_number: nullIfEmpty(reg.aadhar_number.replace(/\s/g, '')),
          user_type: userType as UserType,
        }
      : null;
    const supplier = user.supplier
      ? {
          ...Object.fromEntries(SUP_FIELDS.map((k) => [k, nullIfEmpty(sup[k])])),
          company_name: sup.company_name.trim() || user.supplier.company_name,
          // Keep the public listing's tax numbers in step with the ones edited above.
          gst_number: gst || null,
          fssai_number: nullIfEmpty(reg.fssai_number),
          verification_status: verification,
        }
      : null;
    try {
      await onSave({
        userId: user.user_id,
        profile: { full_name: nullIfEmpty(fullName), phone: nullIfEmpty(accountPhone) },
        registration,
        registrationId: user.registration?.id ?? null,
        supplier,
        supplierId: user.supplier?.id ?? null,
      });
    } catch {
      // The hook already shows the error toast.
    }
  };

  const field = (k: RegField, label: string, opts: { placeholder?: string; textarea?: boolean; span?: boolean } = {}) => (
    <div className={`space-y-1.5 ${opts.span ? 'sm:col-span-2' : ''}`}>
      <Label htmlFor={`reg-${k}`}>{label}</Label>
      {opts.textarea ? (
        <Textarea id={`reg-${k}`} value={reg[k]} onChange={(e) => setR(k, e.target.value)} rows={3} placeholder={opts.placeholder} />
      ) : (
        <Input id={`reg-${k}`} value={reg[k]} onChange={(e) => setR(k, e.target.value)} placeholder={opts.placeholder}
          className={errors[k] ? 'border-destructive' : ''} />
      )}
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  const supField = (k: SupField, label: string, opts: { textarea?: boolean; span?: boolean } = {}) => (
    <div className={`space-y-1.5 ${opts.span ? 'sm:col-span-2' : ''}`}>
      <Label htmlFor={`sup-${k}`}>{label}</Label>
      {opts.textarea
        ? <Textarea id={`sup-${k}`} value={sup[k]} onChange={(e) => setS(k, e.target.value)} rows={3} />
        : <Input id={`sup-${k}`} value={sup[k]} onChange={(e) => setS(k, e.target.value)} />}
    </div>
  );

  const section = (title: string, children: React.ReactNode, note?: string) => (
    <section className="space-y-3">
      <div className="border-b pb-1.5">
        <h3 className="font-semibold">{title}</h3>
        {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );

  const r = user.registration;
  const documents = [
    ['CV / Resume', r?.cv_url], ['Aadhaar front', r?.aadhar_front_url], ['Aadhaar back', r?.aadhar_back_url],
    ['Passport photo', r?.passport_photo_url], ['Menu', r?.menu_upload_url],
    ...(r?.uploaded_photos ?? []).map((url, i) => [`Photo ${i + 1}`, url]),
  ].filter((d): d is [string, string] => !!d[1]);

  const isB2B = userType === 'b2b' || userType === 'b2c';

  return (
    <Sheet open onOpenChange={(o) => { if (!saving) onOpenChange(o); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 space-y-6 pb-28">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.avatar_url ?? undefined} />
                <AvatarFallback className="text-lg">{user.full_name?.charAt(0) ?? user.email?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="truncate">{user.full_name || r?.company_name || 'Unnamed User'}</SheetTitle>
                <SheetDescription className="truncate">{user.email}</SheetDescription>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {user.role && <Badge variant="secondary" className="capitalize">{user.role}</Badge>}
                  {r?.user_type && <Badge variant="outline">{USER_TYPES.find((t) => t.value === r.user_type)?.label}</Badge>}
                  {user.supplier && <Badge variant="outline" className="capitalize">Listing: {user.supplier.verification_status}</Badge>}
                </div>
              </div>
            </div>
          </SheetHeader>

          {!r && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>This user has no sign-up details saved yet. Fill in the fields below and choose a user type to add them.</p>
            </div>
          )}

          {section('Account', (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="acc-name">Full name</Label>
                <Input id="acc-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-phone">Account phone</Label>
                <Input id="acc-phone" value={accountPhone} onChange={(e) => setAccountPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Login email</Label>
                <Input value={user.email ?? ''} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={user.role ?? undefined} onValueChange={(v) => onRoleChange(v as Role)} disabled={roleUpdating}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Joined {format(new Date(user.created_at), 'd MMMM yyyy')}. The login email can't be changed here. Role changes save straight away.
              </p>
            </>
          ), undefined)}

          {section('Tax & compliance', (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="reg-gst_number">GST number</Label>
                <div className="relative">
                  <Input id="reg-gst_number" value={reg.gst_number} maxLength={15} placeholder="24AAPFC8060R1ZQ"
                    onChange={(e) => setR('gst_number', e.target.value.toUpperCase().replace(/\s/g, ''))}
                    className={`pr-9 uppercase ${errors.gst_number ? 'border-destructive' : ''}`} />
                  {gstState === 'valid' && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />}
                  {gstState === 'invalid' && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
                </div>
                {errors.gst_number && <p className="text-xs text-destructive">{errors.gst_number}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-fssai_number">FSSAI number</Label>
                <Input id="reg-fssai_number" value={reg.fssai_number} maxLength={14} inputMode="numeric" placeholder="14 digits"
                  onChange={(e) => setR('fssai_number', e.target.value.replace(/\D/g, ''))}
                  className={errors.fssai_number ? 'border-destructive' : ''} />
                {errors.fssai_number && <p className="text-xs text-destructive">{errors.fssai_number}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-aadhar_number">Aadhaar number</Label>
                <Input id="reg-aadhar_number" value={reg.aadhar_number} maxLength={14} inputMode="numeric" placeholder="12 digits"
                  onChange={(e) => setR('aadhar_number', e.target.value.replace(/[^\d\s]/g, ''))}
                  className={errors.aadhar_number ? 'border-destructive' : ''} />
                {errors.aadhar_number && <p className="text-xs text-destructive">{errors.aadhar_number}</p>}
              </div>
            </>
          ), user.supplier ? 'GST and FSSAI are also updated on this user\'s supplier listing.' : undefined)}

          {section('Business details', (
            <>
              <div className="space-y-1.5">
                <Label>User type</Label>
                <Select value={userType || undefined} onValueChange={(v) => { setUserType(v as UserType); setErrors((e) => ({ ...e, user_type: '' })); }}>
                  <SelectTrigger className={errors.user_type ? 'border-destructive' : ''}><SelectValue placeholder="Select user type" /></SelectTrigger>
                  <SelectContent>{USER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
                {errors.user_type && <p className="text-xs text-destructive">{errors.user_type}</p>}
              </div>
              {field('company_name', 'Company name')}
              {field('full_name', 'Owner / full name')}
              {field('website', 'Website', { placeholder: 'https://' })}
              {isB2B && field('b2b_category', 'B2B category')}
              {isB2B && field('moq', 'Minimum order quantity')}
              {userType === 'horeca' && field('horeca_category', 'HoReCa category')}
              {userType === 'franchise' && field('franchise_category', 'Franchise category')}
              {userType === 'franchise' && field('preferred_franchise_location', 'Preferred franchise location')}
              {userType !== 'recruitment' && field('certifications_text', 'Certifications', { span: true })}
              {userType === 'horeca'
                ? field('menu_description', 'Menu description', { textarea: true, span: true })
                : userType !== 'recruitment' && field('product_description', 'Product description', { textarea: true, span: true })}
            </>
          ))}

          {userType === 'recruitment' && section('Job seeker details', (
            <>
              {field('qualification', 'Qualification')}
              {field('years_experience', 'Years of experience')}
              {field('job_category', 'Job category')}
              {field('preferred_city', 'Preferred city')}
            </>
          ))}

          {section('Location', (
            <>
              {field('address', 'Address', { span: true })}
              {field('city', 'City')}
              <div className="space-y-1.5">
                <Label>State</Label>
                <Select value={reg.state || undefined} onValueChange={(v) => setR('state', v)}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {[...new Set([...(reg.state ? [reg.state] : []), ...INDIAN_STATES])].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {field('country', 'Country')}
              {field('google_location', 'Google location', { placeholder: 'Google Maps link' })}
            </>
          ))}

          {section('Contact', (
            <>
              {field('phone', 'Phone')}
              {field('whatsapp', 'WhatsApp')}
              {field('email', 'Contact email')}
              {field('contact_person_name', 'Contact person')}
              {field('contact_designation', 'Designation')}
              {field('contact_phone', 'Contact phone')}
            </>
          ))}

          {user.supplier && section('Supplier listing', (
            <>
              {supField('company_name', 'Listing company name')}
              <div className="space-y-1.5">
                <Label>Verification</Label>
                <Select value={verification} onValueChange={(v) => setVerification(v as VerificationStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {supField('phone', 'Listing phone')}
              {supField('email', 'Listing email')}
              {supField('address', 'Listing address', { span: true })}
              {supField('city', 'City')}
              {supField('state', 'State')}
              {supField('pincode', 'Pincode')}
              {supField('website', 'Website')}
              {supField('business_description', 'Business description', { textarea: true, span: true })}
            </>
          ), 'What buyers see on the public supplier page.')}

          {documents.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-semibold border-b pb-1.5">Uploaded documents</h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {documents.map(([label, url]) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 border-t bg-background p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Close</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {r || !regTouched ? 'Save changes' : 'Add details'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
