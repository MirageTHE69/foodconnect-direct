import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Search, MessageSquare, Heart } from "lucide-react";
import { DashboardLayout } from "@/components/shared/DashboardLayout";

export default function BuyerDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">What would you like to do today?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Browse Products</CardTitle>
                <CardDescription>Explore food products</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/suppliers')}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Find Suppliers</CardTitle>
                <CardDescription>Search verified suppliers</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/chat')}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Messages</CardTitle>
                <CardDescription>Chat with suppliers</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/saved')}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg">Saved Items</CardTitle>
                <CardDescription>Your favorites</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Here's how to make the most of FoodAdda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold">Browse Categories</h4>
                  <p className="text-sm text-muted-foreground">Explore various food product categories to find what you need.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold">Connect with Suppliers</h4>
                  <p className="text-sm text-muted-foreground">Find verified suppliers and view their profiles and products.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold">Start Conversations</h4>
                  <p className="text-sm text-muted-foreground">Chat directly with suppliers to discuss your requirements.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
