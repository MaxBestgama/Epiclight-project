import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <span>MYGAMELIST™</span>
        <span>© 2024 All rights reserved</span>
      </div>
    </footer>
  );
}
