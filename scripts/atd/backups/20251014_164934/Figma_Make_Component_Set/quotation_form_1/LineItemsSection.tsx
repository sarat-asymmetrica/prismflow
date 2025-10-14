import { useState } from "react";
import { Copy, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { LineItem } from "../lib/types";
import { mockProducts } from "../lib/mock-data";
import { calculateLineTotal, formatCurrency } from "../lib/utils";

interface LineItemsSectionProps {
  lineItems: LineItem[];
  onLineItemsChange: (items: LineItem[]) => void;
}

export function LineItemsSection({
  lineItems,
  onLineItemsChange,
}: LineItemsSectionProps) {
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      productCode: "",
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 18,
      lineTotal: 0,
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], ...updates };

    // Recalculate line total
    const item = updated[index];
    updated[index].lineTotal = calculateLineTotal(
      item.quantity,
      item.unitPrice,
      item.discountPercent,
      item.taxPercent,
    );

    onLineItemsChange(updated);
  };

  const deleteLineItem = (index: number) => {
    if (lineItems.length > 1) {
      onLineItemsChange(lineItems.filter((_, i) => i !== index));
    }
  };

  const duplicateLineItem = (index: number) => {
    const item = { ...lineItems[index], id: `item-${Date.now()}` };
    onLineItemsChange([...lineItems, item]);
  };

  const selectProduct = (index: number, product: any) => {
    updateLineItem(index, {
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      unitPrice: product.price,
      taxPercent: product.taxRate,
    });
    setOpenPopovers({ ...openPopovers, [index]: false });
  };

  return (
    <SectionCard
      icon={ShoppingCart}
      title="Line Items"
      subtitle={`${lineItems.length} ${lineItems.length === 1 ? "item" : "items"}`}
    >
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-600 w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs text-gray-600 min-w-[200px]">
                Product/Service
              </th>
              <th className="px-4 py-3 text-right text-xs text-gray-600 w-24">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-xs text-gray-600 w-32">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-xs text-gray-600 w-28">
                Discount %
              </th>
              <th className="px-4 py-3 text-right text-xs text-gray-600 w-32">
                Tax %
              </th>
              <th className="px-4 py-3 text-right text-xs text-gray-600 w-32">
                Line Total
              </th>
              <th className="px-4 py-3 text-center text-xs text-gray-600 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr
                key={item.id}
                className="line-item-row border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <Popover
                    open={openPopovers[index] || false}
                    onOpenChange={(open) =>
                      setOpenPopovers({ ...openPopovers, [index]: open })
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-2 bg-white border-gray-200"
                      >
                        {item.productName ? (
                          <div className="flex flex-col items-start">
                            <span className="text-sm text-gray-900">
                              {item.productName}
                            </span>
                            <span className="text-xs text-gray-600">
                              {item.productCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Search products...
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search products..." />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {mockProducts.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => selectProduct(index, product)}
                                className="flex flex-col items-start p-3"
                              >
                                <span className="text-sm text-gray-900">
                                  {product.name}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {product.code}
                                </span>
                                <span className="text-xs text-green-600 mt-1">
                                  {formatCurrency(product.price, "INR")}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(index, {
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="text-right bg-white border-gray-200"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateLineItem(index, {
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="text-right bg-white border-gray-200"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discountPercent}
                    onChange={(e) =>
                      updateLineItem(index, {
                        discountPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="text-right bg-white border-gray-200"
                  />
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={item.taxPercent.toString()}
                    onValueChange={(value) =>
                      updateLineItem(index, { taxPercent: parseFloat(value) })
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Tax (0%)</SelectItem>
                      <SelectItem value="5">GST 5%</SelectItem>
                      <SelectItem value="12">GST 12%</SelectItem>
                      <SelectItem value="18">GST 18%</SelectItem>
                      <SelectItem value="28">GST 28%</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right text-green-600">
                  {formatCurrency(item.lineTotal, "INR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateLineItem(index)}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate item</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLineItem(index)}
                            disabled={lineItems.length === 1}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete item</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {lineItems.map((item, index) => (
          <div
            key={item.id}
            className="p-4 border border-gray-200 rounded-xl bg-white space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-900">
                  {item.productName || "No product selected"}
                </p>
                {item.productCode && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {item.productCode}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-600">#{index + 1}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(index, {
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="mt-1 bg-white border-gray-200"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Unit Price</label>
                <Input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateLineItem(index, {
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1 bg-white border-gray-200"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Line Total</span>
                <span className="text-green-600">
                  {formatCurrency(item.lineTotal, "INR")}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicateLineItem(index)}
                className="flex-1"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteLineItem(index)}
                disabled={lineItems.length === 1}
                className="flex-1 text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addLineItem}
        className="mt-4 text-[#6C63FF] border-[#6C63FF] hover:bg-[#6C63FF] hover:text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Line Item
      </Button>
    </SectionCard>
  );
}
