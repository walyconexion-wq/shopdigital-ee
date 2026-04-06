import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

async function debugInvoices() {
  console.log("--- DEBUGGING INVOICES ---");
  const querySnapshot = await getDocs(collection(db, "facturas"));
  console.log(`Total invoices found: ${querySnapshot.size}`);
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | ShopId: ${data.shopId} | ShopName: ${data.shopName} | TownId: ${data.townId} | Locality: ${data.locality}`);
  });
  
  console.log("--- DEBUGGING SHOPS ---");
  const shopsSnapshot = await getDocs(collection(db, "comercios"));
  shopsSnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | Name: ${data.name} | Slug: ${data.slug} | TownId: ${data.townId}`);
  });
}

debugInvoices();
