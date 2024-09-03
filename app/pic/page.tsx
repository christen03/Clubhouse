'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NextLinkButton from '../../components/NextLinkButton';
import { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';
import ActiveSetter from '@/components/ActiveSetter';
import Link from 'next/link';
import styles from './styles.module.css';
import logo from './akpsilogo.png';
import Image from 'next/image';
import ApplicantCard from '@/components/ApplicantCard';
import {
  getUsers,
  getIsPIC,
  getApplication,
  getCases,
  getInterviews,
  getIsActive,
} from '../supabase/getUsers';
import ApplicationPopup from '@/components/ApplicationPopUp';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-toastify';

interface Packet {
  id: string;
  created_at: string;
  full_name: string;
  is_active: boolean;
  is_pic: boolean;
  application: string | null; 
  case_study: string | null; 
  interview: string | null; 
  email: string;
  active_case_studies: string | null; 
  active_interviews: string | null; 
  total_score: number | null;
}

export default function ProtectedPage() {
  const [usersData, setUserData] = useState<Packet[]>([]);
  const [isPIC, setIsPIC] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState<
    string | null
  >(null);
  const [userID, setUserID] = useState<string>('');
  const [currentApplication, setCurrentApplication] = useState<any | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<any[]>([]); 
  const [interviews, setInterviews] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [sortType, setSortType] = useState<'name' | 'score'>('name');

  const supabase = createClient();

  const toggleApplicantSelection = (applicantId: string) => {
    setSelectedApplicants((prevSelected) => {
      if (prevSelected.includes(applicantId)) {
        return prevSelected.filter((id) => id !== applicantId);
      } else {
        return [...prevSelected, applicantId];
      }
    });
  };

  const sortUsers = () => {
    if (sortType === 'name') {
      const sortedByScore = [...usersData].sort((a, b) => {
        const scoreA = a.total_score ?? 0;
        const scoreB = b.total_score ?? 0;
        return scoreB - scoreA; 
      });
      setUserData(sortedByScore);
      setSortType('score');
    } else {
      const sortedByName = [...usersData].sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      );
      setUserData(sortedByName);
      setSortType('name');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Begin loading
      try {
        const usersData = await getUsers();
        setUserData(usersData);
        const picStatus = await getIsPIC();
        setIsPIC(picStatus);
        const activeStatus = await getIsActive();
        setIsActive(activeStatus);

        // Any additional data fetching logic can be included here
        // After all data fetching is completed
        setIsLoading(false); // End loading
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false); // Ensure loading is ended even if there is an error
      }
    };

    fetchData();
  }, []); // Dependency array left empty to run only on component mount

  useEffect(() => {
    const getCasesForUser = async () => {
      const cases = (await getCases(userID)) || [];
      setCases(cases);
    };

    getCasesForUser();
  }, [userID]);

  useEffect(() => {
    const getInterviewsForUser = async () => {
      const interviews = (await getInterviews(userID)) || [];
      setInterviews(interviews);
    };

    getInterviewsForUser();
  }, [userID]);

  useEffect(() => {
    const fetchApplication = async () => {
      if (currentApplicationId) {
        const applicationData = await getApplication(currentApplicationId);
        setCurrentApplication(applicationData);
      }
    };

    fetchApplication();
  }, [currentApplicationId]);

  const handleViewApplication = async (
    applicationId: string,
    userId: string
  ) => {
    setCurrentApplicationId(applicationId);
    setUserID(userId);
  };

  const handleClosePopup = () => {
    setCurrentApplication(null); 
    setCurrentApplicationId(null);
  };
  const filteredUsersData = usersData.filter((applicant) =>
    applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner />; 
  }

  const handleSubmitDelibs = async () => {
    try {
      const { data: delibsData, error: fetchError } = await supabase
        .from('delibs')
        .select('id');

      if (fetchError) throw fetchError;

      const deletePromises = delibsData.map((delib) =>
        supabase.from('delibs').delete().match({ id: delib.id })
      );

      await Promise.all(deletePromises);

      const rowsToInsert = selectedApplicants.map((applicantId) => ({
        prospect_id: applicantId,
      }));

      const { error: insertError } = await supabase
        .from('delibs')
        .insert(rowsToInsert);

      if (insertError) throw insertError;

      toast.success('Delibs submitted successfully');
      setSelectedApplicants([]); 
    } catch (error) {
      console.error('Error handling delibs:', error);
      toast.success('Failed to handle delibs');
    }
  };

  return (
    <div className="flex-1 w-full flex justify-center items-center py-10">
      <div className="animate-in w-full mx-8">
        <div className="text-center">
          <p className="text-xl lg:text-4xl leading-tight mb-2">PIC Portal</p>

          {isPIC ? (
            <div>
              <div className="flex justify-center items-center w-full">
                <div className="flex items-center mb-4 max-w-md w-full">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow px-4 py-2 border rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  />
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold ml-8 py-2 px-4 rounded-lg"
                    onClick={handleSubmitDelibs}
                  >
                    DELIBS
                  </button>
                </div>
                <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold ml-4 py-2 px-4 rounded-lg"
                    onClick={sortUsers}
                  >
                    Sort by {sortType === 'name' ? 'score' : 'name'}
                  </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredUsersData.map((applicant: Packet) => (
                  <div key={applicant.id} className="flex flex-col">
                    <ApplicantCard
                      key={applicant.id}
                      applicant={applicant}
                      onViewApplication={handleViewApplication}
                    />
                    <button
                      className={`ml-2 ${
                        selectedApplicants.includes(applicant.id)
                          ? 'bg-green-500'
                          : 'bg-gray-700'
                      } hover:bg-green-700 text-white text-sm w-1/4 font-bold py-1 px-2 rounded`}
                      onClick={() => toggleApplicantSelection(applicant.id)}
                    >
                      {selectedApplicants.includes(applicant.id)
                        ? 'Deselect'
                        : 'Select'}
                    </button>
                  </div>
                ))}
                {currentApplication && (
                  <ApplicationPopup
                    application={currentApplication}
                    cases={cases}
                    interviews={interviews}
                    userID={userID}
                    isPIC={isPIC}
                    onClose={handleClosePopup}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <p>You are not on PIC.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
