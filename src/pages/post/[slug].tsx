/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';


import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post } : PostProps) {
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

        </div>
      </div>
    </>
  );
};

export const getStaticPaths = async () => {
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

export const getStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

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

  return {
    props: {
      post,
    },
  }
};
