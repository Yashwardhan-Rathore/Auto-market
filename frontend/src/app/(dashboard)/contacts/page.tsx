import type { Metadata } from 'next';
import { ContactsListView } from '@/features/contacts';

export const metadata: Metadata = {
  title: 'Contacts CRM',
};

export default function ContactsPage() {
  return <ContactsListView />;
}
