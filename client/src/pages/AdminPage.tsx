import React from 'react';
import { ProductUpdaterControls } from '@/components/admin/ProductUpdaterControls';

const AdminPage: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Controls</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Product Update Controls</h2>
          <p className="text-muted-foreground mb-6">
            Use these controls to check for new products, update prices, and manage product availability.
            These updates simulate real-time data from external websites and retailers.
          </p>
          <ProductUpdaterControls />
        </section>
      </div>
    </div>
  );
};

export default AdminPage;