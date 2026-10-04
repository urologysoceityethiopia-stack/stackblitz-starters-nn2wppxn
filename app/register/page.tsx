import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function RegisterPage() {
  return (
    <MarketingLayout>
      <div className="container-wide py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Create Your Account</h1>
          <p className="text-muted-foreground mb-8">
            Sign up for NutriMed to start your personalized nutrition journey.
          </p>
          <div className="bg-secondary/50 rounded-lg p-8">
            <p className="text-muted-foreground">
              Registration form coming soon. Please check back later or contact us at hello@nutrimed.et
            </p>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
