/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';

import { FiCalendar, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [postLoaded, setPostLoaded] = useState(postsPagination.results);
  const [nextPage, setnextPage] = useState(postsPagination.next_page);

  function LoadMore() {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const postLoadedResponse = data.results[0];

        const formatPost = {
          uid: postLoadedResponse.uid,
          first_publication_date: postLoadedResponse.first_publication_date,
          data: {
            title: postLoadedResponse.data.title,
            subtitle: postLoadedResponse.data.subtitle,
            author: postLoadedResponse.data.author,
          },
        };

        setPostLoaded([...postLoaded, formatPost]);
        setnextPage(postLoadedResponse.next_page);
      });
  }

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.content}>
        {postLoaded.map(post => (
          <Link href={`post/${post.uid}`} key={post.uid}>
            <div className={styles.post}>
              <h1 className={commonStyles.heading}>{post.data.title}</h1>
              <p className={commonStyles.text}>{post.data.subtitle}</p>
              <div className={commonStyles.infoContainer}>
                <span>
                  <FiCalendar />
                  <time>
                    {new Date(post.first_publication_date)
                      .toLocaleDateString('pt-br', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                      .replace('.', '')}
                  </time>
                </span>
                <span>
                  <FiUser />
                  <a>{post.data.author}</a>
                </span>
              </div>
            </div>
          </Link>
        ))}
        {nextPage && (
          <button className={styles.loadMore} onClick={LoadMore} type="button">
            <span>Carregar mais posts</span>
          </button>
        )}

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: { next_page: postsResponse.next_page, results: posts },
      preview,
    },
  };
};
