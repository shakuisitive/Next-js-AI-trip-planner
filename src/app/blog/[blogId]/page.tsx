import { contentfulClient } from '@/lib/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Document, BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import type { BlogPost } from '@/lib/contentful';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const options = {
  renderNode: {
    [BLOCKS.HEADING_1]: (node: any, children: any) => (
      <h1 className="text-5xl font-bold mb-6 text-[#1F2937]">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node: any, children: any) => (
      <h2 className="text-4xl font-bold mb-5 text-[#1F2937]">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node: any, children: any) => (
      <h3 className="text-3xl font-bold mb-4 text-[#1F2937]">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node: any, children: any) => (
      <h4 className="text-2xl font-bold mb-3 text-[#1F2937]">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (node: any, children: any) => (
      <h5 className="text-xl font-bold mb-3 text-[#1F2937]">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (node: any, children: any) => (
      <h6 className="text-lg font-bold mb-2 text-[#1F2937]">{children}</h6>
    ),
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
      <p className="mb-6 leading-relaxed text-lg text-[#1F2937]">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node: any, children: any) => (
      <ul className="list-disc list-inside mb-6 space-y-3 text-lg text-[#1F2937]">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: any, children: any) => (
      <ol className="list-decimal list-inside mb-6 space-y-3 text-lg text-[#1F2937]">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node: any, children: any) => (
      <li className="mb-2">{children}</li>
    ),
    [BLOCKS.QUOTE]: (node: any, children: any) => (
      <blockquote className="border-l-4 border-[#2563EB] pl-6 italic my-8 text-xl text-[#6B7280]">{children}</blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-[#E5E7EB]" />,
    [INLINES.HYPERLINK]: (node: any, children: any) => (
      <a 
        href={node.data.uri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[#2563EB] hover:text-[#1E40AF] underline"
      >
        {children}
      </a>
    ),
    [INLINES.ASSET_HYPERLINK]: (node: any, children: any) => (
      <a 
        href={node.data.target.fields.file.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[#2563EB] hover:text-[#1E40AF] underline"
      >
        {children}
      </a>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const { title, description, file } = node.data.target.fields;
      return (
        <div className="my-8">
          <img
            src={file.url}
            alt={title || description || ''}
            className="max-w-full h-auto rounded-lg shadow-md"
          />
          {description && (
            <p className="text-base text-[#6B7280] mt-3">{description}</p>
          )}
        </div>
      );
    },
  },
  renderMark: {
    [MARKS.BOLD]: (text: any) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text: any) => <em>{text}</em>,
    [MARKS.UNDERLINE]: (text: any) => <u>{text}</u>,
    [MARKS.CODE]: (text: any) => (
      <code className="bg-[#F3F4F6] px-2 py-1 rounded text-[#1F2937]">{text}</code>
    ),
  },
};

async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const response = await contentfulClient.getEntry(id, {
      include: 2,
    });

    if (!response.fields) {
      return null;
    }

    return {
      title: response.fields.title as string,
      blogContent: response.fields.blogContent,
      authorName: response.fields.authorName as string,
      featuredImage: response.fields.featuredImage as any,
      sys: {
        id: response.sys.id,
        createdAt: response.sys.createdAt,
      },
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export default async function BlogPost({ params }: { params: { blogId: string } }) {
  const post = await getBlogPost(params.blogId);

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#F3F4F6]">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6 text-[#1F2937]">Blog Post Not Found</h1>
              <p className="mb-8 text-lg text-[#6B7280]">The blog post you're looking for doesn't exist.</p>
              <Link 
                href="/blog"
                className="inline-block bg-[#2563EB] text-white px-8 py-4 rounded-lg hover:bg-[#1E40AF] transition-colors text-lg font-semibold"
              >
                Back to Blog
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F3F4F6]">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <Link 
            href="/blog"
            className="inline-block mb-8 text-[#2563EB] hover:text-[#1E40AF] text-lg"
          >
            ← Back to Blog
          </Link>
          
          <h1 className="text-5xl font-bold mb-6 text-[#1F2937]">{post.title}</h1>
          
          <div className="flex items-center gap-4 mb-8 text-[#6B7280] text-lg">
            <span>By {post.authorName}</span>
            <span>•</span>
            <span>{new Date(post.sys.createdAt).toLocaleDateString()}</span>
          </div>

          {post.featuredImage && (
            <div className="relative w-full h-[500px] mb-10 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={`https:${post.featuredImage.fields.file.url}`}
                alt={post.featuredImage.fields.title || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-md">
            {documentToReactComponents(post.blogContent as Document, options)}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
} 