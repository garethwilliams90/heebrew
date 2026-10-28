import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kofi_donations")
      .select("id, from_name, message, amount, currency, donated_at")
      .eq("is_public", true)
      .order("donated_at", { ascending: false })
      .limit(6);

    if (error || !data) {
      return Response.json({ supporters: [] });
    }

    return Response.json({
      supporters: data.map((row) => ({
        id: row.id,
        name: row.from_name,
        message: row.message,
        amount: Number(row.amount),
        currency: row.currency,
      })),
    });
  } catch {
    return Response.json({ supporters: [] });
  }
}
