import VerifyAccount from "./VerifyAccountClient";


interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
    const resolveSearchParams = await searchParams;
    const userEmail = resolveSearchParams.email as string || "";

    return (
        <VerifyAccount email={userEmail} />
    );
}