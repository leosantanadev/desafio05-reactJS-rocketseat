/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <a>
          <Image
            src="/logo.png"
            width={238}
            height={25}
            layout="fixed"
            alt="logo"
          />
        </a>
      </Link>
    </header>
  );
}
