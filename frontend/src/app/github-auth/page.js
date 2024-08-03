import GithubAuth from "@/components/github-auth";

const Page = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-6">Please authorize us access to your Github repositories to create a holistic profile for you!</h1>
                <GithubAuth />
            </div>
        </div>
    );
}

export default Page;