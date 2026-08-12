import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  author_name: string;
  author_name_ar: string | null;
  role: string | null;
  role_ar: string | null;
  company: string | null;
  company_ar: string | null;
  quote: string;
  quote_ar: string | null;
  avatar_url: string | null;
  company_logo_url: string | null;
  rating: number;
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type TestimonialInput = Omit<Testimonial, "id" | "created_at" | "updated_at"> & { id?: string };

/**
 * Real customer case studies (UAE government & enterprise document-management
 * projects delivered by Infasme). Used as the fallback set when the DB has no
 * published testimonials, and as the source for the home proof section. Quotes
 * are faithful paraphrases of the published case studies.
 */
export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "cs-union-insurance",
    author_name: "Anshul Srivastav",
    author_name_ar: null,
    role: "Chief Information Officer",
    role_ar: "الرئيس التنفيذي لتقنية المعلومات",
    company: "Union Insurance",
    company_ar: "الاتحاد للتأمين",
    quote:
      "We reduced our annual costs by 30% and improved our teams' efficiency — and we're proud to be among the first in the region running a full-fledged ECM on the cloud.",
    quote_ar:
      "خفّضنا تكاليفنا السنوية بنسبة 30% وحسّنّا كفاءة فرقنا، ونفخر بأننا من الأوائل في المنطقة في تشغيل نظام إدارة محتوى مؤسسي متكامل على السحابة.",
    avatar_url: null,
    company_logo_url: null,
    rating: 5,
    featured: true,
    sort_order: 10,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "cs-dubai-economy",
    author_name: "Mohamed Khalifa Alqaizi",
    author_name_ar: "محمد خليفة القايزي",
    role: "IT Director",
    role_ar: "مدير تقنية المعلومات",
    company: "Dubai Economy",
    company_ar: "اقتصادية دبي",
    quote:
      "It had a huge impact on digitizing our documents — cutting daily costs, strengthening document security, and making our day-to-day team collaboration far more efficient.",
    quote_ar:
      "كان له أثر كبير في رقمنة مستنداتنا؛ إذ خفّض التكاليف اليومية وعزّز أمن المستندات وجعل التعاون اليومي بين الفرق أكثر كفاءة.",
    avatar_url: null,
    company_logo_url: null,
    rating: 5,
    featured: true,
    sort_order: 20,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "cs-mohp",
    author_name: "Dr. Fatmah Waalali",
    author_name_ar: "د. فاطمة وعلالي",
    role: "Deputy Director, Financial Affairs & Budget",
    role_ar: "نائب مدير الشؤون المالية والميزانية",
    company: "Ministry of Health & Prevention – UAE",
    company_ar: "وزارة الصحة ووقاية المجتمع",
    quote:
      "We fully digitized our documents in around eight months. We now have a secure, controlled environment accessible from anywhere, so our team processes payment vouchers easily and in minimum time.",
    quote_ar:
      "رقمنّا مستنداتنا بالكامل خلال ثمانية أشهر تقريبًا، وأصبح لدينا بيئة آمنة ومنضبطة يمكن الوصول إليها من أي مكان، فبات فريقنا يعالج سندات الدفع بسهولة وبأقل وقت وجهد.",
    avatar_url: null,
    company_logo_url: null,
    rating: 5,
    featured: true,
    sort_order: 30,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "cs-fujairah-finance",
    author_name: "Alia",
    author_name_ar: "عالية",
    role: "IT Manager",
    role_ar: "مدير تقنية المعلومات",
    company: "Fujairah Finance",
    company_ar: "دائرة مالية الفجيرة",
    quote:
      "It saved us around 50% of our costs and gave our team an efficient way to handle daily and backlog operations — a real step toward complete document management.",
    quote_ar:
      "وفّر لنا نحو 50% من التكاليف، ومنح فريقنا وسيلة فعّالة لإدارة العمليات اليومية والمتراكمة، في خطوة حقيقية نحو إدارة مستندات متكاملة.",
    avatar_url: null,
    company_logo_url: null,
    rating: 5,
    featured: true,
    sort_order: 40,
    published: true,
    created_at: "",
    updated_at: "",
  },
];

export const useTestimonials = () =>
  useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    },
    staleTime: 60_000,
  });

export const useAdminTestimonials = () =>
  useQuery({
    queryKey: ["testimonials", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    },
  });

export const useSaveTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TestimonialInput) => {
      const payload = {
        author_name: input.author_name,
        author_name_ar: input.author_name_ar || null,
        role: input.role || null,
        role_ar: input.role_ar || null,
        company: input.company || null,
        company_ar: input.company_ar || null,
        quote: input.quote,
        quote_ar: input.quote_ar || null,
        avatar_url: input.avatar_url || null,
        company_logo_url: input.company_logo_url || null,
        rating: input.rating ?? 5,
        featured: input.featured ?? false,
        sort_order: input.sort_order ?? 0,
        published: input.published ?? true,
      };
      if (input.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

export const useDeleteTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};
