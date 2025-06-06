import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  const description =
    (movie.overview || movie.description || "").slice(0, 100) + "...";

  // Vérifie si le film est ajouté manuellement
  const isCustom = movie.isCustom || movie.poster_path?.startsWith("data:image");

  // Utilise base64/local image si c'est un film personnalisé
  const imageUrl = isCustom
    ? movie.poster_path || movie.image
    : `https://image.tmdb.org/t/p/w300${movie.poster_path}`;

  return (
    <Card className="flex flex-row bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl text-white max-w-xl h-80 rounded-2xl shadow-2xl shadow-purple-500/10 transition-all duration-300 hover:shadow-purple-500/20 hover:-translate-y-2 hover:scale-105 border border-purple-500/20 hover:border-purple-400/40">
      <div className="w-1/3 relative overflow-hidden rounded-l-2xl">
        <img
          src={imageUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <CardBody className="w-2/3 p-4 flex flex-col justify-between h-full">
        <div className="flex-1">
          <Typography variant="h6" color="white" className="font-black text-lg mb-2 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent tracking-tight leading-tight">
            {movie.title}
          </Typography>
          <Typography className="text-xs text-gray-300 mt-1 leading-relaxed line-clamp-3">
            {description}
          </Typography>

          {movie.vote_average > 0 && (
            <div className="mt-2 flex items-center">
              <div className="flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30 shadow-lg shadow-yellow-400/10">
                <Typography className="text-base text-yellow-400 font-bold tracking-wide">
                  {movie.vote_average.toFixed(1)}
                </Typography>
                <span className="ml-1.5 text-yellow-400 text-base drop-shadow-sm">⭐</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Link to={`/film/${movie.id}`}>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-purple-500/25 border-0">
              READ MORE
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}