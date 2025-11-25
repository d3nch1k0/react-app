// app/page.js - это ваша главная страница (/)
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
      <>
      <html className={styles.html}>
        <header className={styles.header}>
        <div className={styles.block1}>
          <nav className={styles.nav}>
            {/* Используйте Link из Next.js */}
            <Link href="/about"className={styles.bottom}>Settings</Link>
            <Link href="/blog"className={styles.bottom}>Account</Link>
          </nav>
        </div>
        </header>
        <main className={styles.main}>

        </main>
        <footer className={styles.footer}>
          You have viewed all the content
        </footer>
      </html>
    </>
  );
}
