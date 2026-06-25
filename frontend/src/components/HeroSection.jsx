import { useNavigate } from "react-router-dom";
export const HeroSection = ({isLoggedIn}) => {
    const navigate=useNavigate();

  return (
    <section className="max-w-6xl mx-auto p-8">
      <div className="bg-white border border-gray-200 rounded-3xl px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm">
        
        {/* Left Content */}
        <div className="max-w-md">
          <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mb-4">
            # Code. Compile. Conquer.
          </span>

          <h1 className="text-5xl font-bold leading-tight text-gray-900">
            Master coding
            <br />
            with
            <span className="text-blue-500"> CodeEdge</span>
          </h1>

          <p className="mt-5 text-gray-500 text-lg">
            Your all-in-one platform to write, compile, and challenge
            yourself with real-world problems — all in one seamless
            workspace.
          </p>

          <button onClick={()=>{
            console.log(isLoggedIn)
            if (!isLoggedIn) {

      navigate("/login");
    } 
    else{
        navigate("/problems")
    }
          }} className="mt-8 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition">
            🚀 Start Coding
          </button>
        </div>

        {/* Right Image */}
        <div className="w-full max-w-lg">
          <img
            src="https://imgs.search.brave.com/Fv1R9U1IfpaeDukqnvMzV66_sVxhd_eJ4Orbdv42oFE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTIy/NDUwMDQ1Ny9waG90/by9wcm9ncmFtbWlu/Zy1jb2RlLWFic3Ry/YWN0LXRlY2hub2xv/Z3ktYmFja2dyb3Vu/ZC1vZi1zb2Z0d2Fy/ZS1kZXZlbG9wZXIt/YW5kLWNvbXB1dGVy/LXNjcmlwdC5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9bkhN/eXBrTVRVMUhVVVc4/NVp0MEZmN01EYnEx/N24wZVZlWGFvTTlL/bnQ0UT0"
            alt="Code Editor"
            className="w-full rounded-2xl shadow-lg"
          />
        </div>

      </div>
    </section>
  );
};