import PaymentStatus from "@/components/pages/payment/PaymentStatus";
import { Metadata } from "next";
import { PaymentStatusPageParams } from "@/types";

export const metadata: Metadata = {
  title: "Payment Status | OpenBook.Games",
};

export default async function PaymentStatusPage({ params }: PaymentStatusPageParams) {
  const { gameId } = await params;
  
  return <PaymentStatus gameId={gameId} />;
}

