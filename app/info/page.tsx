import { redirect } from 'next/navigation';
import { INFO_PAGE_ROUTES } from '../../utils/infoContent';

export default function InfoRootPage() {
    redirect(INFO_PAGE_ROUTES.about);
}
