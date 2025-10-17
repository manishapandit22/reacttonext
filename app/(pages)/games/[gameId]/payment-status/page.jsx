import PaymentStatus from "@/components/pages/payment/PaymentStatus";

export const metadata = {
  title: "Payment Status | OpenBook.Games",
};

export default function PaymentStatusPage({ params }) {
  return <PaymentStatus gameId={params.gameId} />;
}
