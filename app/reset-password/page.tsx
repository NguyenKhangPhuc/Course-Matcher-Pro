import ResetPasswordClient from "./ResetPasswordClient";


interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
    const resolveSearchParams = await searchParams;
    const userEmail = resolveSearchParams.email as string || "";

    return (
        <div className="w-full min-h-screen screen-bg font-roboto-mono">
            <div className="max-w-7xl mx-auto px-6 flex flex-col p-5 justify-center items-center h-screen">
                <ResetPasswordClient email={userEmail} />

            </div>
        </div>
    );
}