import React from "react";
import { FilterState } from "./types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Users, Package, UserCircle, DollarSign, X } from "lucide-react";

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    (filters.customer && filters.customer.length > 0) ||
    (filters.product && filters.product.length > 0) ||
    (filters.salesperson && filters.salesperson.length > 0) ||
    (filters.valueRange &&
      (filters.valueRange.min > 0 || filters.valueRange.max < 1000000));

  // Mock data - in production, these would come from API
  const customers = [
    "Acme Corp",
    "TechStart Inc",
    "Global Industries",
    "Future Systems",
    "Mega Retail",
  ];
  const products = ["Product A", "Product B", "Product C", "Service Package"];
  const salespeople = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Williams",
  ];

  const addCustomer = (customer: string) => {
    const current = filters.customer || [];
    if (!current.includes(customer)) {
      onFiltersChange({ ...filters, customer: [...current, customer] });
    }
  };

  const removeCustomer = (customer: string) => {
    const current = filters.customer || [];
    onFiltersChange({
      ...filters,
      customer: current.filter((c) => c !== customer),
    });
  };

  const addProduct = (product: string) => {
    const current = filters.product || [];
    if (!current.includes(product)) {
      onFiltersChange({ ...filters, product: [...current, product] });
    }
  };

  const removeProduct = (product: string) => {
    const current = filters.product || [];
    onFiltersChange({
      ...filters,
      product: current.filter((p) => p !== product),
    });
  };

  const addSalesperson = (person: string) => {
    const current = filters.salesperson || [];
    if (!current.includes(person)) {
      onFiltersChange({ ...filters, salesperson: [...current, person] });
    }
  };

  const removeSalesperson = (person: string) => {
    const current = filters.salesperson || [];
    onFiltersChange({
      ...filters,
      salesperson: current.filter((s) => s !== person),
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg" style={{ color: "#212529" }}>
          Filters
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Filter */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Users size={16} style={{ color: "#6C757D" }} />
            Customer
          </Label>
          <Select onValueChange={addCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer} value={customer}>
                  {customer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.customer && filters.customer.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.customer.map((customer) => (
                <Badge
                  key={customer}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => removeCustomer(customer)}
                >
                  {customer}
                  <X size={12} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Product Filter */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Package size={16} style={{ color: "#6C757D" }} />
            Product
          </Label>
          <Select onValueChange={addProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product} value={product}>
                  {product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.product && filters.product.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.product.map((product) => (
                <Badge
                  key={product}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => removeProduct(product)}
                >
                  {product}
                  <X size={12} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Salesperson Filter */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <UserCircle size={16} style={{ color: "#6C757D" }} />
            Sales Rep
          </Label>
          <Select onValueChange={addSalesperson}>
            <SelectTrigger>
              <SelectValue placeholder="Select sales rep" />
            </SelectTrigger>
            <SelectContent>
              {salespeople.map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.salesperson && filters.salesperson.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.salesperson.map((person) => (
                <Badge
                  key={person}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => removeSalesperson(person)}
                >
                  {person}
                  <X size={12} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Value Range Filter */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <DollarSign size={16} style={{ color: "#6C757D" }} />
            Deal Value Range
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.valueRange?.min || ""}
              onChange={(e) => {
                const min = parseInt(e.target.value) || 0;
                onFiltersChange({
                  ...filters,
                  valueRange: {
                    min,
                    max: filters.valueRange?.max || 1000000,
                  },
                });
              }}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.valueRange?.max || ""}
              onChange={(e) => {
                const max = parseInt(e.target.value) || 1000000;
                onFiltersChange({
                  ...filters,
                  valueRange: {
                    min: filters.valueRange?.min || 0,
                    max,
                  },
                });
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
