import { CustomerTable } from "./components/CustomerTable";

export default function App() {
  return (
    <CustomerTable
      userId="user-1"
      role="ADMIN"
      juliusEnabled={true}
      onCustomerClick={(customer) => {
        console.log("Customer clicked:", customer);
      }}
    />
  );
}
