import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import AnimatedIcon from '@site/src/components/AnimatedIcon';
import CampusMap from '@site/src/components/CampusMap';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout
      title="Home"
      description="Course notes and shared resources from the Westlake Noter community."
    >
      <main className={styles.home}>
        <section className={styles.hero} aria-labelledby="home-title">
          <CampusMap />
          <div className={styles.edgeGlass} aria-hidden="true" />
          <div className={styles.copy}>
            <p className={styles.eyebrow}>A student-led, open-source collection</p>
            <h1 id="home-title">Westlake Noter</h1>
            <p className={styles.intro}>
              Notes worth sharing.<br />Knowledge worth building together.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primary} to="/notes/">
                <AnimatedIcon name="book" /> Explore notes
              </Link>
              <Link className={styles.secondary} to="/tools/">
                <AnimatedIcon name="tools" /> Tools
              </Link>
            </div>
          </div>
          <div className={styles.caption}>
            <span>Westlake University <span aria-hidden="true">&middot;</span> Yungu Campus</span>
            <span className={styles.credits}>
              Map: <a href="https://terraink.app">terraink.app</a>
              {' / '}<a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>
            </span>
          </div>
        </section>
        <section className={styles.explore} aria-labelledby="explore-title">
          <div className={styles.sectionHeading}>
            <h2 id="explore-title">Explore the collection</h2>
            <p>Shared by students. Open to everyone.</p>
          </div>
          <div className={styles.destinations}>
            <Link to="/notes/" className={styles.destination}>
              <AnimatedIcon name="book" size={24} />
              <div><h3>Course Notes</h3><p>Browse notes by subject and course.</p></div>
            </Link>
            <Link to="/tools/" className={styles.destination}>
              <AnimatedIcon name="tools" size={24} />
              <div><h3>Tools <span className={styles.soon}>Coming soon</span></h3><p>A space for useful study tools.</p></div>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
