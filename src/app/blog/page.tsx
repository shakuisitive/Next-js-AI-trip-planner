import { contentfulClient } from "@/lib/contentful";
import {
  Document,
  Block,
  Inline,
  BLOCKS,
  INLINES,
  MARKS,
} from "@contentful/rich-text-types";
import { BlogPost } from "@/lib/contentful";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Function to get plain text from rich text content
function getPlainText(content: any): string {
  if (!content) return "";

  let text = "";
  content.content.forEach((node: any) => {
    if (node.nodeType === "paragraph") {
      node.content.forEach((textNode: any) => {
        if (textNode.nodeType === "text") {
          text += textNode.value + " ";
        }
      });
    }
  });
  return text.trim();
}

// Function to truncate text to a certain number of words
function truncateText(text: string, wordCount: number): string {
  const words = text.split(" ");
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "...";
}

async function getBlogPosts() {
  try {
    const response = await contentfulClient.getEntries({
      content_type: "blogPost",
      order: ["-sys.createdAt"],
      include: 2,
    });

    return response.items.map((item: any) => ({
      title: item.fields.title,
      blogContent: item.fields.blogContent,
      authorName: item.fields.authorName,
      featuredImage: item.fields.featuredImage,
      sys: {
        id: item.sys.id,
        createdAt: item.sys.createdAt,
      },
    }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export default async function Blog() {
  const blogPosts = await getBlogPosts();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F3F4F6]">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl mt-10 font-bold mb-12 text-center text-[#1F2937]">
            Blog Posts
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post: BlogPost) => {
              const excerpt = truncateText(getPlainText(post.blogContent), 50);

              return (
                <Link
                  href={`/blog/${post.sys.id}`}
                  key={post.sys.id}
                  className="group"
                >
                  <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#E5E7EB]">
                    {post.featuredImage && (
                      <div className="relative w-full h-56">
                        <Image
                          src={`https:${post.featuredImage.fields.file.url}`}
                          alt={post.featuredImage.fields.title || post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold mb-4 group-hover:text-[#2563EB] transition-colors text-[#1F2937]">
                        {post.title}
                      </h2>
                      <p className="text-[#6B7280] mb-6 text-lg line-clamp-3">
                        {excerpt}
                      </p>
                      <div className="flex items-center justify-between text-base text-[#6B7280]">
                        <span>By {post.authorName}</span>
                        <span>
                          {new Date(post.sys.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
