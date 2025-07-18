import { Box } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";

type ShortsProps = {
  isSidebarExpanded: boolean;
};

const videoList = [
  "https://www.youtube.com/watch?v=JAnYzWpBhAw&list=RDJAnYzWpBhAw&start_radio=1",
  "https://www.youtube.com/watch?v=JAnYzWpBhAw&list=RDJAnYzWpBhAw&start_radio=1",
  // Add more YouTube Shorts links here...
];

export const Shorts: React.FC<ShortsProps> = ({ isSidebarExpanded }) => {
  const [videos, setVideos] = useState(videoList);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to load more videos when scrolling near the bottom
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        // Load more videos when scrolling near the bottom
        setVideos((prevVideos) => [
          ...prevVideos,
          ...videoList, // Add more videos from the list to simulate infinite scroll
        ]);
      }
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        marginLeft: isSidebarExpanded ? 30 : 10,
        marginTop: 10,
      }}
      px={4}
      py={2}
    >
      {/* Render YouTube Shorts */}
      {videos.map((videoUrl, index) => (
        <Box
          key={index}
          sx={{
            marginBottom: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <iframe
            width="40%"
            height="800"
            src={videoUrl}
            title={`YouTube Shorts ${index}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              borderRadius: "10px",
            }}
          ></iframe>
        </Box>
      ))}
    </Box>
  );
};
