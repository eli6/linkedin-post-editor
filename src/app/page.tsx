import Image from "next/image";
import styles from "./page.module.css";
import LinkedInPostEditor from "./linkedin-post-editor";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
      
      <LinkedInPostEditor/>
      </div>
    </main>
  );
}
