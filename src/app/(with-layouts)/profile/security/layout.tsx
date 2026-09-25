import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bảo mật',
};

export default function SecurityPageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
