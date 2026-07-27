"use server";

import { getAuthorProfileData, getAuthorSalesData, getAuthorReviewsData } from "./auth";

export interface SearchResult {
  id: string | number;
  title: string;
  subtitle: string;
  image?: string;
  url: string;
  type: "book" | "sale" | "sale_book" | "review" | "review_book" | "community";
  price?: number;
  recentSales?: any[];
  chartData?: any[];
  rating?: number;
  reviewsCount?: number;
  recentReviews?: any[];
}

export async function searchDashboard(query: string, category: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    if (category === "Books") {
      const profile = await getAuthorProfileData();
      if (profile && profile.books) {
        const matches = profile.books.filter((b: any) => b.title.toLowerCase().includes(q));
        matches.forEach((b: any) => {
            results.push({
                id: b.book_id || Math.random().toString(),
                title: b.title,
                subtitle: `Rating: ${b.rating} | Reviews: ${b.reviews}`,
                url: "/books",
                type: "book"
            });
        });
      }
    } else if (category === "Sales") {
      const salesData = await getAuthorSalesData();
      if (salesData && salesData.books) {
         const booksArray = Array.isArray(salesData.books) ? salesData.books : Object.values(salesData.books);
         const matches = booksArray.filter((b: any) => b.title && b.title.toLowerCase().includes(q));
         
         const storeUrl = process.env.STORE_URL || "http://localhost:5000";

         matches.slice(0, 10).forEach((b: any) => {
             const bookTransactions = (salesData.transactions || []).filter((t:any) => t.bookTitle === b.title);
             
             // group by month for chart to show lifetime curve
             const chartMap: Record<string, number> = {};
             if (bookTransactions.length > 0) {
                 // Sort ascending
                 const sortedTx = [...bookTransactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                 let startDate = new Date(sortedTx[0].date);
                 startDate.setDate(1);
                 let endDate = new Date(sortedTx[sortedTx.length - 1].date);
                 endDate.setDate(1);
                 
                 // Fill all months with 0
                 let current = new Date(startDate);
                 while (current <= endDate) {
                     const mStr = current.toISOString().substring(0, 7);
                     chartMap[mStr] = 0;
                     current.setMonth(current.getMonth() + 1);
                 }
                 
                 // Ensure at least 6 months for a nice graph
                 while (Object.keys(chartMap).length < 6) {
                     startDate.setMonth(startDate.getMonth() - 1);
                     const mStr = startDate.toISOString().substring(0, 7);
                     chartMap[mStr] = 0;
                 }
                 
                 // Add actual units
                 sortedTx.forEach((t:any) => {
                     let dStr = t.date;
                     if (t.date.includes(" ")) dStr = t.date.split(" ")[0]; 
                     const monthStr = dStr.substring(0, 7);
                     if (chartMap[monthStr] !== undefined) {
                         chartMap[monthStr] += t.units;
                     } else {
                         chartMap[monthStr] = t.units; // Fallback
                     }
                 });
             }
             
             let chartData = Object.keys(chartMap).sort().map(date => ({ date, units: chartMap[date] }));
             if (chartData.length === 0) {
                 chartData = [{ date: '1', units: 0 }, { date: '2', units: 0 }];
             }

             let imageUrl = b.coverImage || "";
             if (imageUrl && imageUrl.startsWith("/")) {
                 imageUrl = `${storeUrl}${imageUrl}`;
             }

             let displayPrice = b.costPrice || 0;
             if (displayPrice === 0 && bookTransactions.length > 0) {
                 displayPrice = bookTransactions[0].price || 0;
             }

             results.push({
                 id: b.title || Math.random().toString(),
                 title: b.title,
                 subtitle: "Matching Book",
                 image: imageUrl,
                 url: "/sales",
                 type: "sale_book",
                 price: displayPrice,
                 recentSales: bookTransactions.slice(0, 3), // assume they are roughly sorted
                 chartData: chartData
             });
         });
      }
    } else if (category === "Reviews") {
      const reviewsData = await getAuthorReviewsData();
      const profile = await getAuthorProfileData();
      const salesData = await getAuthorSalesData();

      if (reviewsData && reviewsData.reviews) {
         const booksArray = profile?.books || [];
         const matches = booksArray.filter((b: any) => b.title && b.title.toLowerCase().includes(q));

         const storeUrl = process.env.STORE_URL || "http://localhost:5000";

         matches.slice(0, 10).forEach((b: any) => {
             const bookReviews = reviewsData.reviews.filter((r: any) => r.book === b.title);
             
             // Sort by date descending and take 3
             const recentReviews = bookReviews.sort((a:any, b:any) => new Date(b.isoDate || b.date).getTime() - new Date(a.isoDate || a.date).getTime()).slice(0, 3);
             
             let displayPrice = 0;
             let imageUrl = b.coverImageUrl || b.coverImage || "";
             if (salesData && salesData.books) {
                 const sBookArray = Array.isArray(salesData.books) ? salesData.books : Object.values(salesData.books);
                 const sBook = sBookArray.find((sb: any) => sb.title === b.title);
                 if (sBook) {
                     displayPrice = sBook.costPrice || 0;
                     if (displayPrice === 0) {
                         const bookTransactions = (salesData.transactions || []).filter((t:any) => t.bookTitle === b.title);
                         if (bookTransactions.length > 0) displayPrice = bookTransactions[0].price || 0;
                     }
                     if (sBook.coverImage) {
                         imageUrl = sBook.coverImage;
                     }
                 }
             }

             if (imageUrl && imageUrl.startsWith("/")) {
                 imageUrl = `${storeUrl}${imageUrl}`;
             }

             results.push({
                 id: b.book_id || b.title || Math.random().toString(),
                 title: b.title,
                 subtitle: "Matching Book",
                 image: imageUrl,
                 url: "/reviews",
                 type: "review_book",
                 price: displayPrice,
                 rating: b.rating || 0,
                 reviewsCount: b.reviews || bookReviews.length,
                 recentReviews: recentReviews
             });
         });
      }
    } else if (category === "Community") {
        const threads = [
            { id: 1, title: "How to market my first book effectively?", author: "Jane Doe" },
            { id: 2, title: "Is Amazon KDP better than wide distribution?", author: "Mark Smith" },
            { id: 3, title: "Writing group for sci-fi authors looking for members", author: "Alex Ray" },
            { id: 4, title: "Cover design tips and tricks - what converts?", author: "Sarah Lee" },
            { id: 5, title: "How to get more reviews organically", author: "Michael Chen" },
        ];
        const matches = threads.filter(t => t.title.toLowerCase().includes(q) || t.author.toLowerCase().includes(q));
        matches.forEach(t => {
             results.push({
                 id: t.id,
                 title: t.title,
                 subtitle: `Posted by ${t.author}`,
                 url: "#",
                 type: "community"
             });
        });
    }
  } catch (error) {
      console.error("Search error:", error);
  }

  return results;
}
