import { revalidatePath } from "next/cache";

const HOME_PATHS = ["/", "/books"];

function revalidatePaths(paths: string[]) {
    paths.forEach((path) => {
        try {
            revalidatePath(path);
        } catch (error) {
            console.error(`Failed to revalidate path ${path}`, error);
        }
    });
}

export function revalidateHomePages() {
    revalidatePaths(HOME_PATHS);
}

export function revalidateBookDetail(bookId: string) {
    revalidatePaths([`/books/${bookId}`]);
}

export function revalidateBookPages(bookId: string) {
    revalidateHomePages();
    revalidateBookDetail(bookId);
}
