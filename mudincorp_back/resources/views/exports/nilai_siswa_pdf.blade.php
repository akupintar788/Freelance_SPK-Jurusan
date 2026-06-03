<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapor Siswa</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        h2 {
            text-align: center;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        table, th, td {
            border: 1px solid #000;
        }

        th, td {
            padding: 8px;
            text-align: left;
        }

        .info {
            margin-top: 15px;
        }
    </style>
</head>
<body>

    <h2>LAPORAN NILAI RAPOR SISWA</h2>

    <div class="info">
        <p><strong>Nama:</strong> {{ $siswa->nama }}</p>
        <p><strong>Rata-rata:</strong> {{ $rata_rata }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Mata Pelajaran</th>
                <th>Nilai</th>
                <th>Semester</th>
                <th>Tahun Ajaran</th>
            </tr>
        </thead>
        <tbody>
            @foreach($nilai as $item)
            <tr>
                <td>{{ $item->mata_pelajaran }}</td>
                <td>{{ $item->nilai }}</td>
                <td>{{ $item->semester }}</td>
                <td>{{ $item->tahun_ajaran }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>