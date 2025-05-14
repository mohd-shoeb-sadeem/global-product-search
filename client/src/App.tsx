import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProductPage from "@/pages/ProductPage";
import SearchResults from "@/pages/SearchResults";
import AdminPage from "@/pages/AdminPage";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { UpdateNotifications } from "@/components/UpdateNotifications";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/search" component={SearchResults} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 text-dark">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
          <UpdateNotifications />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
