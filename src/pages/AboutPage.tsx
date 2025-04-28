import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import {
  BookOpen,
  Video,
  FileText,
  Users,
  GraduationCap,
  Search,
  NotebookText,
  Dices,
  Layout,
  Globe,
  Zap,
  Instagram,
  Twitter,
  Send,
  Airplay,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { Helmet } from "react-helmet-async";

interface Statistic {
  label: string;
  value: number;
  icon: typeof BookOpen;
  color: string;
  bgColor: string;
}

interface SocialLink {
  name: string;
  icon: typeof Instagram;
  href: string;
  color: string;
  bgColor: string;
}
export function AboutPage() {
  const [statistics, setStatistics] = useState<Statistic[]>([
    {
      label: "Cours",
      value: 0,
      icon: NotebookText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Vidéos",
      value: 0,
      icon: Video,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "PDF",
      value: 0,
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Flashcard",
      value: 0,
      icon: Dices,
      color: "text-black",
      bgColor: "bg-green-50",
    },
  ]);
  const socialLinks: SocialLink[] = [
    {
      name: "Telegram",
      icon: Send,
      href: "https://t.me/tbiibe",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/tbib.platforms",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      name: "Books",
      icon: Instagram,
      href: "https://www.instagram.com/tbib.series",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      name: "Store",
      icon: Airplay,
      href: "https://book.tbib.space",
      color: "text-blue-800",
      bgColor: "bg-blue-50",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://x.com/itz__mizou",
      color: "text-sky-600",
      bgColor: "bg-sky-50",
    },
  ];


useEffect(() => {
  const fetchData = async () => {
    try {
      const { count: numberOfCourses, error: coursesError } = await supabase
        .from("courses")
        .select("id", { count: "exact" });

      const { count: numberOfFlashcards, error: flashcardsError } =
        await supabase.from("flashcards").select("id", { count: "exact" });

      const { data: pdfData, error: pdfError } = await supabase
        .from("courses")
        .select("pdfs");

      const numberOfPDFs =
        pdfData?.reduce((acc, course) => acc + (course.pdfs?.length || 0), 0) ||
        0;

      const { data: videoData, error: videoError } = await supabase
        .from("courses")
        .select("videos");

      const numberOfVideos =
        videoData?.reduce(
          (acc, course) => acc + (course.videos?.length || 0),
          0
        ) || 0;

      // تحديث القيم مع التأكد من عدم وجود أخطاء
      if (coursesError)
        console.error(
          "Erreur lors de la récupération des cours:",
          coursesError
        );
      if (flashcardsError)
        console.error(
          "Erreur lors de la récupération des flashcards:",
          flashcardsError
        );
      if (pdfError)
        console.error("Erreur lors de la récupération des PDFs:", pdfError);
      if (videoError)
        console.error("Erreur lors de la récupération des vidéos:", videoError);

      // Create final values array and start animation
      const finalValues = [
        numberOfCourses || 0,
        numberOfVideos,
        numberOfPDFs,
        numberOfFlashcards || 0,
      ];

      const duration = 2500; // 2 seconds
      const steps = 60; // Number of steps in the animation
      const interval = duration / steps;

      const incrementValues = finalValues.map((value) => value / steps);

      let step = 0;
      const timer = setInterval(() => {
        if (step < steps) {
          setStatistics((prev) =>
            prev.map((stat, index) => ({
              ...stat,
              value: Math.round(incrementValues[index] * (step + 1)),
            }))
          );
          step++;
        } else {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  fetchData();
}, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>About - TBiB Cours</title>
        <meta
          name="description"
          content="Découvrez TBiB Cours, la plateforme dédiée aux étudiants en médecine en Algérie. Accédez à des cours, résumés et flashcards pour exceller dans vos études médicales."
        />
      </Helmet>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-gray-900 mb-6"
        >
          Bienvenue sur TBiB Cours
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto"
        >
          Votre plateforme d'apprentissage dédiée aux étudiants en médecine en
          Algérie. Notre mission est de rendre l'éducation médicale accessible,
          interactive et efficace.
        </motion.p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {statistics.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center space-x-4">
              <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <motion.div
                  className="text-2xl font-bold text-gray-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                >
                  {stat.value} +
                </motion.div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Contenu Structuré
          </h3>
          <p className="text-gray-600">
            Cours organisés par année, module et unité d'enseignement pour un
            apprentissage progressif et cohérent.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="p-3 bg-purple-50 rounded-lg w-fit mb-4">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Apprentissage Interactif
          </h3>
          <p className="text-gray-600">
            Vidéos explicatives, résumés PDF et flashcards pour une meilleure
            rétention des connaissances.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="p-3 bg-green-50 rounded-lg w-fit mb-4">
            <Search className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recherche Avancée
          </h3>
          <p className="text-gray-600">
            Trouvez rapidement les sujets qui vous intéressent grâce à notre
            fonction de recherche intuitive.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="p-3 bg-orange-50 rounded-lg w-fit mb-4">
            <Layout className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tout-en-un, Zéro Distraction
          </h3>
          <p className="text-gray-600">
            Plus besoin de jongler entre plusieurs plateformes ! Accédez aux
            vidéos, PDF et flashcards sur une seule et même page.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="p-3 bg-cyan-50 rounded-lg w-fit mb-4">
            <Zap className="w-6 h-6 text-cyan-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Rapidité et Accessibilité
          </h3>
          <p className="text-gray-600">
            Un design optimisé pour une navigation fluide et un accès instantané
            aux ressources, sans perte de temps.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="p-3 bg-indigo-50 rounded-lg w-fit mb-4">
            <Globe className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gratuit et Accessible Partout
          </h3>
          <p className="text-gray-600">
            Étudiez où que vous soyez, sur n'importe quel appareil, sans
            restrictions ni frais cachés.
          </p>
        </motion.div>
      </div>

      {/* Vision */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Notre Vision
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 mb-6"
        >
          <strong>TBiB Cours</strong> ambitionne de révolutionner
          l’apprentissage médical en Algérie en offrant une plateforme complète,
          intuitive et interactive. Nous nous engageons à mettre à disposition
          un contenu de haute qualité, constamment mis à jour, et en parfaite
          adéquation avec le programme officiel des facultés de médecine
          algériennes.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-600"
        >
          Notre mission est de :
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>
              Faciliter l'accès aux ressources pédagogiques de manière simple et
              efficace
            </li>
            <li>
              Intégrer des outils interactifs (vidéos, PDF, flashcards) pour un
              apprentissage dynamique
            </li>
            <li>
              Créer une véritable communauté d’entraide et de partage entre
              étudiants en médecine
            </li>
            <li>
              Accompagner les futurs médecins algériens vers l’excellence
              académique et professionnelle
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Social Media Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm p-8 mb-16"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Rejoignez Notre Communauté
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Suivez-nous sur les réseaux sociaux pour rester à jour avec les
          derniers cours et ressources
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex flex-col items-center p-6 rounded-lg transition-transform hover:scale-105",
                social.bgColor
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <social.icon className={cn("w-8 h-8 mb-2", social.color)} />
              <span className={cn("font-medium", social.color)}>
                {social.name}
              </span>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Prêt à commencer votre voyage d'apprentissage ?
        </h2>
        <p className="text-gray-600 mb-8">
          Rejoignez des milliers d'étudiants qui ont déjà fait confiance à{" "}
          <strong>TBiB Cours</strong> pour leur formation médicale.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Commencer Maintenant
          <GraduationCap className="ml-2 w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}
