/* eslint-disable no-plusplus */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import format from 'date-fns/format';
import ptBrLocale from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  last_publication_date?: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  otherLinks: {
    next_post: {
      uid: string | null;
      title: string | null;
    };
    previous_post: {
      uid: string | null;
      title: string | null;
    };
  }
}

export default function Post({ post, otherLinks } : PostProps) {
  return (
    <>
      <div className={styles.bannerSection}>
        <img src={post.data.banner.url} alt="Banner" />
      </div>
      <div className={commonStyles.container}>
        <div className={commonStyles.content}>
          <div className={styles.headingSection}>
            <h1>{post.data.title}</h1>
            <div className={commonStyles.infoContainer}>
              <span>
                <FiCalendar />
                <time>
                  {new Date(post.first_publication_date).toLocaleDateString(
                    'pt-br', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }).replace('.', '')}
                </time>
              </span>
              <span>
                <FiUser />
                <a>{post.data.author}</a>
              </span>
              <span>
                <FiClock />
                <a>4 min</a>
              </span>
            </div>
            <div className={commonStyles.infoContainer}>
              <span>
                * editado em
                <time>
                  {format(new Date(post.last_publication_date), 'PPPPpp', {
                    locale: ptBrLocale
                  })}
                </time>
              </span>
            </div>
          </div>

          {post.data.content.map(content => (
            <div className={styles.bodyContent} key={content.heading}>
              <h1 className={commonStyles.heading}>
                {content.heading}
              </h1>
              <div
                className={commonStyles.text}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}

          <Comments />

          {(otherLinks.next_post.uid || otherLinks.previous_post.uid != null) && (
            <div className={styles.otherLinksContainer}>
              {otherLinks.previous_post.uid != null && (
                <div className={styles.previousPostLink}>
                  <Link href={`${otherLinks.previous_post.uid}`}>
                    <a>{otherLinks.previous_post.title}</a>
                  </Link>
                  <strong>post Anterior</strong>
                </div>
              )}

              {otherLinks.next_post.uid != null && (
                <div className={styles.nextPostLink}>
                  <div>
                    <Link href={`${otherLinks.next_post.uid}`}>
                      <a>{otherLinks.next_post.title}</a>
                    </Link>
                  </div>
                  <strong>proximo post</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(Prismic.predicates.at('document.type', 'posts'));

  const paths = []

  posts.results.map(object => {
    paths.push(
      {"params": {"slug": object.uid}}
    )
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ previewData, params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const prismicResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      ref: previewData?.ref ?? null,
    }
  );

    const response = prismicResponse.results.filter(data => data.uid === slug)[0]
    const currentIndex = prismicResponse.results.findIndex(data => data.uid === slug)

    const nextPost = prismicResponse.results[currentIndex + 1]
    const previousPost = prismicResponse.results[currentIndex - 1]


    const responseContent = response.data.content

    const content = [];

  responseContent.map(array => {
    content.push(
      {
        heading: array.heading,
        body: array.body,
      }
    )
  })

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response?.last_publication_date ?? null,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content,
    }
  }

  const otherLinks = {
    next_post: {
      uid: nextPost?.uid || null,
      title: nextPost?.data?.title || null
    },
    previous_post: {
      uid: previousPost?.uid || null,
      title: previousPost?.data?.title || null
    },
  }

  return {
    props: {
      post,
      otherLinks,
    },
  }
};
