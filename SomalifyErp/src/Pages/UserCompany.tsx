import { GoPlus } from 'react-icons/go';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import DataUsersCom from './ALLUsersData';

function UserCompany() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userInfo')) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Company Users</h2>
          <Link to="/Dashboard/User/Create">
            <button className="bg-blue-800 text-white flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow hover:shadow-lg transition">
              <GoPlus /> Add New
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-x-auto">
          <DataUsersCom />
        </div>
      </div>
    </div>
  );
}

export default UserCompany;
