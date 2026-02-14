import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Search, MessageSquare, Heart, Package, BookOpen, ScanLine } from "lucide-react";
import { DashboardLayout } from "@/components/shared/DashboardLayout";

export default function Dashboard() {
  const navigate = useNavigate();

  const quickActions = [
    { title: "Browse Products", desc: "Explore food products", icon: ShoppingBag, href: "/products", color: "bg-primary/10 text-primary" },
    { title: "Find Suppliers", desc: "Search verified suppliers", icon: Search, href: "/suppliers", color: "bg-secondary/10 text-secondary" },
    { title: "My Products", desc: "Manage your listings", icon: Package, href: "/supplier/products", color: "bg-accent/10 text-accent" },
    { title: "My Recipes", desc: "Share your recipes", icon: BookOpen, href: "/supplier/recipes", color: "bg-primary/10 text-primary" },
    { title: "Messages", desc: "Chat with others", icon: MessageSquare, href: "/chat", color: "bg-muted text-muted-foreground" },
    { title: "Saved Items", desc: "Your favorites", icon: Heart, href: "/saved", color: "bg-destructive/10 text-destructive" },
    { title: "Scan Product", desc: "Scan barcodes", icon: ScanLine, href: "/scan", color: "bg-secondary/10 text-secondary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Card key={action.href} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(action.href)}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Here's how to make the most of FoodAdda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: "1", title: "Browse or Post Products", desc: "Explore food products or list your own for others to discover." },
                { step: "2", title: "Connect with Others", desc: "Find verified suppliers and buyers, view profiles and products." },
                { step: "3", title: "Start Conversations", desc: "Chat directly with suppliers or buyers to discuss requirements." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">{item.step}</div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
