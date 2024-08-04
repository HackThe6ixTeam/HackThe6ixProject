export async function fetchSpiderData(userId, jobId) {
    const response = await fetch(`/api/spider-data?user_id=${userId}&job_id=${jobId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}