import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";


const cardClassName = "rounded-3xl border border-emerald-950/10 bg-white/90 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] ring-0";

export async function WelcomeCard() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const email = data?.claims?.email;

  return (
    <Card className={cardClassName}>
      <CardHeader>
        <CardTitle>Welcome { email }</CardTitle>
        <CardContent className="flex justify-center mt-4">
            <Button asChild>
                <Link href="/decks">Start Learning</Link>
            </Button>
        </CardContent>
      </CardHeader>
    </Card>
  );
}