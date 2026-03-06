import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LawyerSearch from "../components/lawyers/LawyerSearch";
import LawyerCard from "../components/lawyers/LawyerCard";
import Pagination from "../components/common/Pagination";
import { LawyerCardSkeleton } from "../components/common/Skeleton";
import { useNotification } from "../contexts/NotificationContext";
import { getLawyers } from "../services/supabaseApi";
import { getOrCreateConversation } from "../services/chatService";

const LawyerList = () => {

  console.log("LawyerList loaded");

  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {

    const fetchLawyers = async () => {

      try {

        setLoading(true);

        const data = await getLawyers();

        if (!data) throw new Error("No data returned");

        setLawyers(data);
        setFilteredLawyers(data);

      } catch (error) {

        console.error(error);

        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to fetch lawyers. Please try again."
        });

      } finally {

        setLoading(false);

      }

    };

    fetchLawyers();

  }, [addNotification]);

  // -----------------------------
  // CHAT OPEN FUNCTION
  // -----------------------------

  const openChat = async (lawyerId) => {

    try {

      const conversationId = await getOrCreateConversation(lawyerId);

      navigate(`/chat?conversation=${conversationId}`);

    } catch (err) {

      console.error("Chat error:", err);

      addNotification({
        type: "error",
        title: "Chat Error",
        message: "Failed to open chat"
      });

    }

  };

  // -----------------------------
  // SEARCH FILTER
  // -----------------------------

  const handleSearch = (searchData) => {

    const {
      searchQuery,
      specialization,
      experience,
      location,
      priceRange,
      rating
    } = searchData;

    let filtered = [...lawyers];

    if (searchQuery) {

      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((lawyer) =>
        lawyer?.profiles?.first_name?.toLowerCase().includes(query) ||
        lawyer?.specialization?.toLowerCase().includes(query) ||
        lawyer?.location?.toLowerCase().includes(query)
      );

    }

    if (specialization) {

      filtered = filtered.filter(
        (lawyer) =>
          lawyer.specialization?.toLowerCase() ===
          specialization.toLowerCase()
      );

    }

    if (experience) {

      const [min, max] = experience
        .split("-")
        .map((num) => (num === "plus" ? Infinity : parseInt(num)));

      filtered = filtered.filter((lawyer) => {

        const years = parseInt(lawyer.experience) || 0;

        return years >= min && (!max || years <= max || max === Infinity);

      });

    }

    if (location) {

      filtered = filtered.filter(
        (lawyer) =>
          lawyer.location?.toLowerCase() === location.toLowerCase()
      );

    }

    if (priceRange) {

      const [min, max] = priceRange
        .split("-")
        .map((num) => (num === "plus" ? Infinity : parseInt(num)));

      filtered = filtered.filter((lawyer) => {

        const fee = parseInt(lawyer.consultation_fee) || 0;

        return fee >= min && (!max || fee <= max || max === Infinity);

      });

    }

    if (rating) {

      const [min, max] = rating
        .split("-")
        .map((num) => (num === "plus" ? 5 : parseFloat(num)));

      filtered = filtered.filter((lawyer) => {

        const rate = parseFloat(lawyer.rating) || 0;

        return rate >= min && (!max || rate <= max || max === 5);

      });

    }

    setFilteredLawyers(filtered);
    setCurrentPage(1);

  };

  // -----------------------------
  // PAGINATION
  // -----------------------------

  const totalItems = filteredLawyers.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentLawyers = filteredLawyers.slice(startIndex, endIndex);

  return (

    <div className="container mx-auto px-4 py-8">

      <div className="mb-8">

        <h1 className="text-3xl font-bold mb-4">
          Find a Lawyer
        </h1>

        <LawyerSearch onSearch={handleSearch} />

      </div>

      {/* LAWYERS GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <LawyerCardSkeleton key={index} />
            ))
          : currentLawyers.map((lawyer) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                onMessage={() => openChat(lawyer.id)}
              />
            ))}

      </div>

      {!loading && filteredLawyers.length === 0 && (

        <div className="text-center py-12">

          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No lawyers found
          </h3>

          <p className="text-gray-500">
            Try adjusting your search criteria
          </p>

        </div>

      )}

      {filteredLawyers.length > 0 && (

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />

      )}

    </div>

  );

};

export default LawyerList;