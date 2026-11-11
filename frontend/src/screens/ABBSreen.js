import React from 'react';
import { Container } from 'react-bootstrap';
import Header from '../components/Header';

const ABBSreen = () => {
  return (
    <>
      <Header />
      <Container style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
        <h5 className=' text-center m-5'> Politique RH d’Al Barid Bank </h5>
        <p className='mt-3'>
          Nous sommes convaincus que notre Capital Humain est au cœur de la
          réussite de notre Banque. Notre objectif est ainsi de favoriser un
          environnement de vie au travail où nos collaborateurs se sentent bien
          tout en développant chacun par des opportunités d’évolution et des
          parcours de formations personnalisés.{' '}
        </p>
        <h5 className='mt-3'>
          Recrutement : Respect des principes d’objectivité, d’éthique et de
          non-discrimination
        </h5>{' '}
        Al Barid Bank garantit l’ouverture de ses postes à tous les candidats
        lors d'un recrutement, et s'engage à apprécier la valeur d'un candidat
        sur les seuls critères de compétences, motivation et expérience sans
        distinction de genre, handicap, formation, origine ou culture.
        <br />
        <p>
          {' '}
          Al Barid Bank s’engage également à maintenir dans l’emploi et
          accompagner les collaborateurs handicapés dans leur parcours
          professionnel.
        </p>{' '}
        Pour le recrutement des profils juniors, Al Barid Bank opte pour
        l’utilisation de concours permettant ainsi de: Offrir l’égalité des
        chances de réussite et privilégier le mérite pour tous les candidats.
        Promouvoir le recrutement régional par le recrutement de collaborateurs
        parmi les compétences de chaque région, permettant ainsi de donner un
        souffle certain à la dynamique de l’emploi à travers les différentes
        régions du royaume et à l’épanouissement des collaborateurs qui restent
        dans leur région d’origine.
        <h5 className='mt-3'>
          Des collaborateurs compétents, performants et engagés{' '}
        </h5>
        La Politique de Formation d’Al Barid Bank est une politique, à la fois,
        adaptée aux évolutions des métiers de la banque, mais également, à
        l’écoute des besoins exprimés par les collaborateurs ainsi que les
        différentes entités de la banque. Dès recrutement au sein d’Al Barid
        Bank, un parcours d'intégration personnalisé est mis en œuvre, adapté au
        profil du collaborateur, à la diversité des métiers et des organisations
        ainsi qu'aux spécificités des activités. Ce dispositif peut prendre des
        formes différentes : Stages d’immersion, stages d’observations,
        formations spécifiques…et il est complété par la journée « IDMAJ » qui
        permet aux nouvelles recrues d’avoir une vue globale de notre
        établissement et de rencontrer les décideurs. Grâce à ce dispositif, les
        collaborateurs ont la possibilité d’acquérir de nouvelles compétences
        qui leur permettront d‘évoluer professionnellement et de mieux
        contribuer à la montée en performance de la banque.
        <h5 className='mt-3'>
          Reconnaissance du mérite et promotion de la mobilité{' '}
        </h5>
        Al Barid Bank favorise l’évolution de chacun des collaborateurs au sein
        de l’organisation grâce à un management de proximité et à un
        accompagnement personnalisé. Etant une banque jeune, Al Barid Bank
        bénéficie d’un fort trend de développement donnant lieu à la création de
        plusieurs opportunités d’évolution de carrière. La priorité est toujours
        donnée aux collaborateurs internes désireux d’insuffler une nouvelle
        énergie à leur parcours professionnel pour combler les nouveaux besoins.
        C’est dans ce contexte qu’Al Barid Bank offre plus de 500 opportunités
        de mobilité chaque année. Une forte culture d’entreprise avec des
        valeurs partagées par l’ensemble des collaborateurs Al Barid Bank
        favorise le partage d’une culture commune pour permettre que nos
        valeurs, nos attitudes et nos principes d’action soient effectivement
        mis en œuvre tout en respectant la diversité et les héritages de nos
        différentes activités. Découvrez nos valeurs
      </Container>
    </>
  );
};

export default ABBSreen;
