import Image from "next/image";

type ProfileCardProps = {
  name: string;
  imageUrl: string;
  department: string;
  role: string;
  skills: string[];
  about: string;
};

export const ProfileCard = ({
  name,
  imageUrl,
  department,
  role,
  skills,
  about,
}: ProfileCardProps) => {
  return (
    <div className="max-w-sm mx-auto rounded-2xl shadow-lg p-6 bg-white border border-gray-200">
      <div className="flex flex-col items-center text-center">
        <Image
          className="rounded-full"
          src={imageUrl}
          width={100}
          height={100}
          alt={name}
        />
        <h2 className="mt-4 text-xl font-bold">{name}</h2>
        <p className="text-gray-500">{department}</p>
        <p className="text-gray-600 text-sm">{role}</p>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-700">🛠 得意な技術・スキル</h3>
        <ul className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
          {skills.map((skill, idx) => (
            <li
              key={idx}
              className="bg-gray-100 px-2 py-1 rounded-md text-xs"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-700">📝 自由記載欄</h3>
        <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{about}</p>
      </div>
    </div>
  );
};
