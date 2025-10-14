import { useState } from "react";
import { Edit2, Search, User } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Customer } from "../lib/types";
import { mockCustomers } from "../lib/mock-data";
import { formatAddress, generateAvatarColor, getInitials } from "../lib/utils";

interface CustomerSectionProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
}

export function CustomerSection({
  selectedCustomer,
  onCustomerSelect,
}: CustomerSectionProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SectionCard icon={User} title="Customer Details">
      <div className="space-y-4">
        {!selectedCustomer ? (
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-gray-700">
              <Search className="inline h-4 w-4 mr-1.5 text-gray-600" />
              Select Customer <span className="text-red-500">*</span>
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-white border-gray-200 text-left"
                >
                  <span className="text-gray-500">
                    Search customers by name or code...
                  </span>
                  <Search className="ml-2 h-4 w-4 shrink-0 text-gray-600" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search customers..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.id}
                          onSelect={() => {
                            onCustomerSelect(customer);
                            setOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback
                              style={{
                                backgroundColor: generateAvatarColor(
                                  customer.name,
                                ),
                              }}
                              className="text-white text-xs"
                            >
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-600">
                              {customer.code}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarFallback
                  style={{
                    backgroundColor: generateAvatarColor(selectedCustomer.name),
                  }}
                  className="text-white"
                >
                  {getInitials(selectedCustomer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-gray-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedCustomer.code}
                </p>
                {(selectedCustomer.email || selectedCustomer.phone) && (
                  <p className="text-xs text-gray-600 mt-1">
                    {[selectedCustomer.email, selectedCustomer.phone]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCustomerSelect(null)}
                className="text-[#6C63FF]"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Change
              </Button>
            </div>

            {selectedCustomer.billingAddress && (
              <div className="space-y-1">
                <Label className="text-gray-700">Billing Address</Label>
                <p className="text-sm text-gray-600">
                  {formatAddress(selectedCustomer.billingAddress)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
