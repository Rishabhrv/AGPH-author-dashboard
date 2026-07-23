import BookProgressPageCo from "@/components/books/BookProgressPageCo";
import AppShell from "@/components/layout/AppShell";

import { getAuthorBooksProgressData } from "@/actions/auth";

export default async function BookProgressPage() {
  const booksProgress = await getAuthorBooksProgressData();

  return (
    <AppShell active="books">
      <BookProgressPageCo initialData={booksProgress} />
    </AppShell>
  );
}
