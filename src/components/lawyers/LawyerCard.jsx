import { StarIcon, ChatBubbleLeftRightIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const LawyerCard = ({ lawyer }) => {

  const id = lawyer?.id;

  // name from your lawyers table
  const name = `${lawyer?.first_name || ""} ${lawyer?.last_name || ""}`.trim() || "Lawyer";

  const specialization = lawyer?.specialization || "General";
  const experience = lawyer?.experience || 0;

  // since rating column not in your table yet
  const rating = Number(lawyer?.rating || 5).toFixed(1);
  const reviewCount = lawyer?.review_count || 0;

  const consultationFee = lawyer?.consultation_fee || 500;
  const imageUrl = lawyer?.image_url || "https://via.placeholder.com/96";

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">

      <div className="flex gap-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-24 h-24 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex justify-between items-start">

            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="text-gray-600">{specialization}</p>
              <p className="text-sm text-gray-500">{experience} years experience</p>
              <p className="text-sm text-gray-500">Bar: {lawyer?.bar_number || "N/A"}</p>
            </div>

            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 font-medium">{rating}</span>
              <span className="text-gray-500 text-sm ml-1">({reviewCount})</span>
            </div>

          </div>

          <div className="mt-4 flex items-center gap-4">
            <span className="font-medium">৳{consultationFee}</span>

            <span className="text-sm flex items-center text-green-600">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Available
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          to={`/lawyers/${id}`}
          className="flex-1 px-4 py-2 text-center bg-blue-600 text-white rounded-md"
        >
          View Profile
        </Link>

        <Link
          to={`/messages/${id}`}
          className="px-4 py-2 border rounded-md flex items-center justify-center"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />
        </Link>
      </div>

    </div>
  );
};

export default LawyerCard;